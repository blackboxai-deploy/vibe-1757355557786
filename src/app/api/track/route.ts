import { NextRequest, NextResponse } from 'next/server';
import { LocationsDB, generateId } from '@/lib/database';
import { TrackLocationRequest, LocationData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TrackLocationRequest = await request.json();
    
    if (!body.linkId || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { success: false, error: 'Link ID, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const locationData: LocationData = {
      id: generateId(),
      linkId: body.linkId,
      latitude: body.latitude,
      longitude: body.longitude,
      timestamp: new Date().toISOString(),
      userAgent: body.userAgent,
      accuracy: body.accuracy,
      ipAddress: body.ipAddress || request.ip || 'unknown',
    };

    await LocationsDB.create(locationData);

    return NextResponse.json({
      success: true,
      message: 'Location tracked successfully',
      location: locationData,
    });
  } catch (error) {
    console.error('Error tracking location:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');
    
    let locations;
    if (linkId) {
      locations = await LocationsDB.getByLinkId(linkId);
    } else {
      locations = await LocationsDB.getAll();
    }

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}