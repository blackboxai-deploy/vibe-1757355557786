'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LinkGenerator from '@/components/LinkGenerator';
import { TrackingLink } from '@/types';

export default function HomePage() {
  const [recentLinks, setRecentLinks] = useState<TrackingLink[]>([]);

  const handleLinkCreated = (newLink: TrackingLink) => {
    setRecentLinks(prev => [newLink, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <h1 className="text-xl font-bold">LinkTracker Pro</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>📊</span>
                <span>View Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Advanced Location Tracking
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Links with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Precision Location{' '}
              </span>
              Analytics
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate trackable links that capture precise GPS coordinates when accessed. 
              Get real-time location insights with interactive maps and comprehensive analytics.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Precise Tracking</h3>
                <p className="text-sm text-gray-600">
                  Capture exact GPS coordinates with accuracy measurements
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="font-semibold mb-2">Interactive Maps</h3>
                <p className="text-sm text-gray-600">
                  Visualize all tracking data on detailed interactive maps
                </p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-gray-600">
                  Monitor clicks, locations, and user activity in real-time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Link Generator Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <LinkGenerator onLinkCreated={handleLinkCreated} />
        </div>
      </section>

      {/* Recent Links Section */}
      {recentLinks.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Links
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline">
                      View All in Dashboard
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Your most recently created tracking links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{link.title}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {link.originalUrl}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                          <span>Clicks: {link.clickCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(link.trackingUrl)}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">Simple 4-step process to track locations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Create Link',
                description: 'Enter your destination URL and generate a tracking link'
              },
              {
                step: '2',
                title: 'Share Link',
                description: 'Share your tracking link via email, social media, or any channel'
              },
              {
                step: '3',
                title: 'Track Access',
                description: 'When accessed, precise GPS location is captured with user permission'
              },
              {
                step: '4',
                title: 'View Analytics',
                description: 'Monitor all tracking data on interactive maps and detailed analytics'
              }
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Tracking?
          </h2>
          <p className="text-gray-600 mb-8">
            Create your first tracking link and discover precise location insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Generate Your First Link
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span className="font-semibold">LinkTracker Pro</span>
          </div>
          <p className="text-sm text-gray-500">
            Advanced link tracking with precision location analytics
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Privacy-focused • Secure tracking • Real-time analytics
          </div>
        </div>
      </footer>
    </div>
  );
}