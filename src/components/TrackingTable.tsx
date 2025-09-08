'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocationData } from '@/types';

interface TrackingTableProps {
  locations: LocationData[];
  onLocationDeleted?: () => void;
  onLocationSelect?: (location: LocationData) => void;
}

export default function TrackingTable({ 
  locations, 
  onLocationDeleted, 
  onLocationSelect 
}: TrackingTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (locationId: string) => {
    setDeletingId(locationId);
    setError('');

    try {
      const response = await fetch(`/api/track/${locationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (onLocationDeleted) {
          onLocationDeleted();
        }
      } else {
        setError(data.error || 'Failed to delete location');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAccuracyBadge = (accuracy?: number) => {
    if (!accuracy) return null;
    
    if (accuracy <= 10) {
      return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    } else if (accuracy <= 50) {
      return <Badge variant="secondary">Medium</Badge>;
    } else {
      return <Badge variant="outline">Low</Badge>;
    }
  };

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Tracking Data</CardTitle>
          <CardDescription>No tracking data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📍</div>
            <p>Create a tracking link and share it to see location data here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Location Tracking Data
          <Badge variant="secondary">{locations.length} locations</Badge>
        </CardTitle>
        <CardDescription>
          Manage and view detailed location tracking information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Device Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow 
                  key={location.id}
                  className={onLocationSelect ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => onLocationSelect && onLocationSelect(location)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {formatDate(location.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {location.id.substring(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-mono">
                        {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                      </div>
                      {(location.city || location.country) && (
                        <div className="text-xs text-gray-500">
                          {location.city}{location.city && location.country && ', '}{location.country}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getAccuracyBadge(location.accuracy)}
                      {location.accuracy && (
                        <div className="text-xs text-gray-500">
                          ±{location.accuracy}m
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500 max-w-xs">
                      <div className="truncate" title={location.userAgent}>
                        {location.userAgent}
                      </div>
                      {location.ipAddress && (
                        <div className="mt-1">IP: {location.ipAddress}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {onLocationSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLocationSelect(location);
                          }}
                        >
                          View
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === location.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(location.id);
                        }}
                      >
                        {deletingId === location.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Total locations tracked: {locations.length}</span>
            <span>
              Latest: {locations.length > 0 ? formatDate(locations[0].timestamp) : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}