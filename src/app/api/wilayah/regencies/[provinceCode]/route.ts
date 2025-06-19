
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provinceCode: string } }
) {
  const { provinceCode } = params;
  if (!provinceCode) {
    return NextResponse.json({ error: 'Province code is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`, {
      next: { revalidate: 3600 * 24 } // Cache for 1 day
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch regencies for province ${provinceCode} from external API:`, response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch regencies', details: errorText }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in regencies proxy for province ${provinceCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching regencies', details: (error as Error).message }, { status: 500 });
  }
}
