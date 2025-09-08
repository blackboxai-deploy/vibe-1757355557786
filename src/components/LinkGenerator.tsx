'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrackingLink } from '@/types';

interface LinkGeneratorProps {
  onLinkCreated?: (link: TrackingLink) => void;
}

export default function LinkGenerator({ onLinkCreated }: LinkGeneratorProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedLink, setGeneratedLink] = useState<TrackingLink | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedLink(data.link);
        setSuccess('Tracking link created successfully!');
        setUrl('');
        setTitle('');
        if (onLinkCreated) {
          onLinkCreated(data.link);
        }
      } else {
        setError(data.error || 'Failed to create link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Link copied to clipboard!');
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Generate Tracking Link
        </CardTitle>
        <CardDescription>
          Create a trackable link to monitor precise locations when accessed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Destination URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Link Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="My Marketing Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || !url.trim()} className="w-full">
            {loading ? 'Generating...' : 'Generate Tracking Link'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {generatedLink && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center justify-between">
                Link Generated Successfully
                <Badge variant="secondary">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-700">Tracking URL:</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink.trackingUrl}
                    readOnly
                    className="bg-white border-green-300"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedLink.trackingUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Original URL:</span>
                  <p className="text-green-600 truncate">{generatedLink.originalUrl}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700">Title:</span>
                  <p className="text-green-600">{generatedLink.title}</p>
                </div>
              </div>

              <div className="text-xs text-green-600">
                Created: {new Date(generatedLink.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-semibold">How it works:</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Share the generated tracking link with your audience</li>
            <li>When accessed, users will be asked for location permission</li>
            <li>Their precise GPS coordinates will be captured and stored</li>
            <li>Users will be automatically redirected to your original URL</li>
            <li>View all tracking data in the Dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}