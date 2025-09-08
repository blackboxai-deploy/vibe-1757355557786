import { NextRequest, NextResponse } from 'next/server';
import { LinksDB, generateId } from '@/lib/database';
import { CreateLinkRequest, TrackingLink } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const linkId = generateId();
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track/${linkId}`;

    const newLink: TrackingLink = {
      id: linkId,
      originalUrl: body.url,
      trackingUrl,
      title: body.title || 'Untitled Link',
      createdAt: new Date().toISOString(),
      clickCount: 0,
    };

    await LinksDB.create(newLink);

    return NextResponse.json({
      success: true,
      link: newLink,
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = await LinksDB.getAll();
    return NextResponse.json({
      success: true,
      links,
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    if (body.action === 'increment-clicks') {
      await LinksDB.updateClickCount(body.id);
      return NextResponse.json({
        success: true,
        message: 'Click count updated',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');
    
    if (!linkId) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const deleted = await LinksDB.delete(linkId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}