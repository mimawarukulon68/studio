
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://wilayah.id/api/provinces.json', {
      next: { revalidate: 3600 * 24 } // Cache for 1 day
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch provinces from external API:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch provinces', details: errorText }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in provinces proxy:', error);
    return NextResponse.json({ error: 'Internal server error fetching provinces', details: (error as Error).message }, { status: 500 });
  }
}
