export interface TrackingLink {
  id: string;
  originalUrl: string;
  trackingUrl: string;
  createdAt: string;
  title?: string;
  clickCount: number;
}

export interface LocationData {
  id: string;
  linkId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  userAgent: string;
  city?: string;
  country?: string;
  accuracy?: number;
  ipAddress?: string;
}

export interface TrackingStats {
  totalLinks: number;
  totalClicks: number;
  uniqueLocations: number;
  recentActivity: LocationData[];
}

export interface CreateLinkRequest {
  url: string;
  title?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  link?: TrackingLink;
  error?: string;
}

export interface TrackLocationRequest {
  linkId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  userAgent: string;
  ipAddress?: string;
}