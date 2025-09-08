'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TrackingPageState {
  status: 'loading' | 'requesting-permission' | 'tracking' | 'redirecting' | 'error' | 'complete';
  message: string;
  error?: string;
  originalUrl?: string;
  linkTitle?: string;
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;
  
  const [state, setState] = useState<TrackingPageState>({
    status: 'loading',
    message: 'Loading tracking link...'
  });

  const trackLocation = async (latitude: number, longitude: number, accuracy?: number) => {
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          latitude,
          longitude,
          accuracy,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setState({
          status: 'complete',
          message: 'Location tracked successfully!'
        });
        return true;
      } else {
        throw new Error(data.error || 'Failed to track location');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setState({
        status: 'error',
        message: 'Failed to track location',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const requestLocationPermission = () => {
    setState({
      status: 'requesting-permission',
      message: 'Requesting location permission...'
    });

    if (!navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported by this browser',
        error: 'Geolocation not available'
      });
      return;
    }

    setState({
      status: 'tracking',
      message: 'Getting your precise location...'
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        setState({
          status: 'tracking',
          message: `Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy?.toFixed(0)}m)`
        });

        const tracked = await trackLocation(latitude, longitude, accuracy);
        
        if (tracked && state.originalUrl) {
          setState({
            status: 'redirecting',
            message: 'Redirecting to destination...'
          });
          
          // Update click count and redirect
          await fetch('/api/links', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: linkId, action: 'increment-clicks' })
          }).catch(() => {}); // Silent fail for click count

          setTimeout(() => {
            window.location.href = state.originalUrl!;
          }, 2000);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState({
          status: 'error',
          message: errorMessage,
          error: `Error code: ${error.code}`
        });

        // Still redirect after error (optional tracking)
        if (state.originalUrl) {
          setTimeout(() => {
            window.location.href = state.originalUrl!;
          }, 5000);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const skipTracking = () => {
    if (state.originalUrl) {
      window.location.href = state.originalUrl;
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const response = await fetch(`/api/links`);
        const data = await response.json();
        
        if (data.success) {
          const link = data.links.find((l: any) => l.id === linkId);
          
          if (link) {
            setState({
              status: 'requesting-permission',
              message: 'Ready to track location',
              originalUrl: link.originalUrl,
              linkTitle: link.title
            });
          } else {
            setState({
              status: 'error',
              message: 'Tracking link not found',
              error: 'Invalid or expired link'
            });
          }
        } else {
          throw new Error(data.error || 'Failed to fetch link details');
        }
      } catch (error) {
        setState({
          status: 'error',
          message: 'Failed to load tracking link',
          error: error instanceof Error ? error.message : 'Network error'
        });
      }
    };

    if (linkId) {
      fetchLinkDetails();
    }
  }, [linkId]);

  const getStatusBadge = () => {
    switch (state.status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      case 'requesting-permission':
        return <Badge className="bg-blue-100 text-blue-800">Ready</Badge>;
      case 'tracking':
        return <Badge className="bg-yellow-100 text-yellow-800">Tracking</Badge>;
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'redirecting':
        return <Badge className="bg-purple-100 text-purple-800">Redirecting</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <h1 className="text-xl font-bold">LinkTracker Pro</h1>
          </div>
          <CardTitle className="text-2xl">
            {state.linkTitle || 'Location Tracking'}
          </CardTitle>
          <CardDescription>
            This link tracks your location for analytics purposes
          </CardDescription>
          <div className="flex justify-center">
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="text-center">
            <p className="text-gray-700">{state.message}</p>
            {state.error && (
              <p className="text-sm text-red-600 mt-2">{state.error}</p>
            )}
          </div>

          {/* Original URL Display */}
          {state.originalUrl && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Destination URL:</p>
              <p className="text-sm font-mono break-all">{state.originalUrl}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {state.status === 'requesting-permission' && (
              <>
                <Button 
                  onClick={requestLocationPermission}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  size="lg"
                >
                  Allow Location Tracking
                </Button>
                <Button 
                  onClick={skipTracking}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Skip Tracking & Continue
                </Button>
              </>
            )}

            {state.status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={requestLocationPermission}
                  variant="outline"
                  className="w-full"
                >
                  Retry Location Tracking
                </Button>
                <Button 
                  onClick={skipTracking}
                  className="w-full"
                >
                  Continue to Destination
                </Button>
              </div>
            )}

            {state.status === 'complete' && state.originalUrl && (
              <Button 
                onClick={() => window.location.href = state.originalUrl!}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Continue to Destination
              </Button>
            )}

            {(state.status === 'loading' || state.status === 'tracking' || state.status === 'redirecting') && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Privacy Notice:</strong> Your location will be used solely for analytics purposes. 
              No personal information is stored. You can skip tracking and still access the destination.
            </AlertDescription>
          </Alert>

          {/* Location Info */}
          {state.status === 'tracking' || state.status === 'complete' && (
            <div className="text-xs text-gray-500 space-y-1">
              <div>• High accuracy GPS positioning enabled</div>
              <div>• Location data encrypted and anonymized</div>
              <div>• Tracking ID: {linkId.substring(0, 8)}...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}