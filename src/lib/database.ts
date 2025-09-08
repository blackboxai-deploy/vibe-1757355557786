import { promises as fs } from 'fs';
import { join } from 'path';
import { TrackingLink, LocationData } from '@/types';

const DATA_DIR = join(process.cwd(), 'data');
const LINKS_FILE = join(DATA_DIR, 'links.json');
const LOCATIONS_FILE = join(DATA_DIR, 'locations.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize files if they don't exist
async function initializeFile(filePath: string, initialData: any) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
  }
}

// Links database operations
export class LinksDB {
  static async getAll(): Promise<TrackingLink[]> {
    await ensureDataDir();
    await initializeFile(LINKS_FILE, []);
    
    try {
      const data = await fs.readFile(LINKS_FILE, 'utf-8');
      return JSON.parse(data) as TrackingLink[];
    } catch {
      return [];
    }
  }

  static async create(link: TrackingLink): Promise<void> {
    const links = await this.getAll();
    links.push(link);
    await fs.writeFile(LINKS_FILE, JSON.stringify(links, null, 2));
  }

  static async findById(id: string): Promise<TrackingLink | null> {
    const links = await this.getAll();
    return links.find(link => link.id === id) || null;
  }

  static async updateClickCount(id: string): Promise<void> {
    const links = await this.getAll();
    const linkIndex = links.findIndex(link => link.id === id);
    if (linkIndex !== -1) {
      links[linkIndex].clickCount += 1;
      await fs.writeFile(LINKS_FILE, JSON.stringify(links, null, 2));
    }
  }

  static async delete(id: string): Promise<boolean> {
    const links = await this.getAll();
    const filteredLinks = links.filter(link => link.id !== id);
    if (filteredLinks.length < links.length) {
      await fs.writeFile(LINKS_FILE, JSON.stringify(filteredLinks, null, 2));
      return true;
    }
    return false;
  }
}

// Locations database operations
export class LocationsDB {
  static async getAll(): Promise<LocationData[]> {
    await ensureDataDir();
    await initializeFile(LOCATIONS_FILE, []);
    
    try {
      const data = await fs.readFile(LOCATIONS_FILE, 'utf-8');
      return JSON.parse(data) as LocationData[];
    } catch {
      return [];
    }
  }

  static async create(location: LocationData): Promise<void> {
    const locations = await this.getAll();
    locations.push(location);
    await fs.writeFile(LOCATIONS_FILE, JSON.stringify(locations, null, 2));
  }

  static async getByLinkId(linkId: string): Promise<LocationData[]> {
    const locations = await this.getAll();
    return locations.filter(location => location.linkId === linkId);
  }

  static async delete(id: string): Promise<boolean> {
    const locations = await this.getAll();
    const filteredLocations = locations.filter(location => location.id !== id);
    if (filteredLocations.length < locations.length) {
      await fs.writeFile(LOCATIONS_FILE, JSON.stringify(filteredLocations, null, 2));
      return true;
    }
    return false;
  }

  static async deleteByLinkId(linkId: string): Promise<void> {
    const locations = await this.getAll();
    const filteredLocations = locations.filter(location => location.linkId !== linkId);
    await fs.writeFile(LOCATIONS_FILE, JSON.stringify(filteredLocations, null, 2));
  }
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function getStats() {
  const links = await LinksDB.getAll();
  const locations = await LocationsDB.getAll();
  
  return {
    totalLinks: links.length,
    totalClicks: links.reduce((sum, link) => sum + link.clickCount, 0),
    uniqueLocations: locations.length,
    recentActivity: locations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  };
}