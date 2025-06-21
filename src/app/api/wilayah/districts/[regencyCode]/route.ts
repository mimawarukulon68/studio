
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { regencyCode: string } }
) {
  const { regencyCode } = params;
  if (!regencyCode) {
    return NextResponse.json({ error: 'Regency code is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://wilayah.id/api/districts/${regencyCode}.json`, {
      next: { revalidate: 3600 * 24 } // Cache for 1 day
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch districts for regency ${regencyCode} from external API:`, response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch districts', details: errorText }, { status: response.status });
    }
    const data = await response.json();
    // The external API nests the array in a "data" property. We return only the array.
    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error(`Error in districts proxy for regency ${regencyCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching districts', details: (error as Error).message }, { status: 500 });
  }
}
