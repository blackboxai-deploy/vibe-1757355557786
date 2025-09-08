'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LocationDashboard from '@/components/LocationDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                <h1 className="text-xl font-bold">LinkTracker Pro</h1>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>🔗</span>
                <span>Create New Link</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <LocationDashboard />
      </main>
    </div>
  );
}