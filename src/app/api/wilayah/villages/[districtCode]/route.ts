
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { districtCode: string } }
) {
  const { districtCode } = params;
  if (!districtCode) {
    return NextResponse.json({ error: 'District code is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://wilayah.id/api/villages/${districtCode}.json`, {
      next: { revalidate: 3600 * 24 } // Cache for 1 day
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch villages for district ${districtCode} from external API:`, response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch villages', details: errorText }, { status: response.status });
    }
    const data = await response.json();
    // The external API nests the array in a "data" property. We return only the array.
    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error(`Error in villages proxy for district ${districtCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching villages', details: (error as Error).message }, { status: 500 });
  }
}
