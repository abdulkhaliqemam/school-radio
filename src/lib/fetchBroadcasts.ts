import cacheData from '../data/broadcasts.cache.json';

export interface Broadcast {
  id: string;
  title: string;
  date: string;
  topic: string;
  grade: string;
  category: string;
  presenter: string;
  video: string;
  cover: string;
  images: string[];
  description: string;
  published: boolean;
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  const apiUrl = import.meta.env.BROADCASTS_API_URL;
  
  if (!apiUrl) {
    console.warn("BROADCASTS_API_URL is not set. Falling back to cache.");
    return cacheData as Broadcast[];
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch broadcasts: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Broadcast[];
  } catch (error) {
    console.error("Error fetching broadcasts from API. Falling back to cache.", error);
    return cacheData as Broadcast[];
  }
}
