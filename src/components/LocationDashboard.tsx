'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MapComponent from './MapComponent';
import TrackingTable from './TrackingTable';
import { LocationData, TrackingLink } from '@/types';

export default function LocationDashboard() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both locations and links
      const [locationsResponse, linksResponse] = await Promise.all([
        fetch('/api/track'),
        fetch('/api/links')
      ]);

      const locationsData = await locationsResponse.json();
      const linksData = await linksResponse.json();

      if (locationsData.success) {
        // Sort by timestamp (newest first)
        const sortedLocations = locationsData.locations.sort(
          (a: LocationData, b: LocationData) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLocations(sortedLocations);
      } else {
        setError(locationsData.error || 'Failed to fetch locations');
      }

      if (linksData.success) {
        setLinks(linksData.links);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLocationDeleted = () => {
    fetchData(); // Refresh data after deletion
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const getStats = () => {
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    const uniqueLocations = new Set(locations.map(loc => `${loc.latitude}-${loc.longitude}`)).size;
    const recentActivity = locations.slice(0, 5);

    return {
      totalLinks: links.length,
      totalClicks,
      uniqueLocations,
      totalTracked: locations.length,
      recentActivity
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tracking Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and analyze location tracking data in real-time
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold">{stats.totalLinks}</p>
              </div>
              <Badge variant="secondary">Links</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
              </div>
              <Badge variant="default">Clicks</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locations Tracked</p>
                <p className="text-2xl font-bold">{stats.totalTracked}</p>
              </div>
              <Badge variant="outline">Tracked</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Locations</p>
                <p className="text-2xl font-bold">{stats.uniqueLocations}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Unique</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Location Map
            {locations.length > 0 && (
              <Badge variant="secondary">{locations.length} markers</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Interactive map showing all tracked locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length > 0 ? (
            <MapComponent
              locations={locations}
              height="500px"
              onMarkerClick={handleLocationSelect}
            />
          ) : (
            <div className="h-96 border rounded-lg flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <p>No location data to display yet.</p>
                <p className="text-sm mt-2">Create and share tracking links to see locations here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Selected Location Details</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedLocation(null)}
              className="w-fit"
            >
              Clear Selection
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Latitude:</span>
                <p className="font-mono">{selectedLocation.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="font-medium">Longitude:</span>
                <p className="font-mono">{selectedLocation.longitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
                <p>{new Date(selectedLocation.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">Accuracy:</span>
                <p>{selectedLocation.accuracy ? `±${selectedLocation.accuracy}m` : 'N/A'}</p>
              </div>
            </div>
            {selectedLocation.userAgent && (
              <div>
                <span className="font-medium text-sm">User Agent:</span>
                <p className="text-xs text-gray-600 mt-1">{selectedLocation.userAgent}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tracking Table */}
      <TrackingTable
        locations={locations}
        onLocationDeleted={handleLocationDeleted}
        onLocationSelect={handleLocationSelect}
      />

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest 5 location tracking events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentActivity.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(location.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedLocation(location)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}