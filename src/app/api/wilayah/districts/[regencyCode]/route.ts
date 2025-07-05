
import { type NextRequest, NextResponse } from 'next/server';
import allDistricts from '@/data/wilayah/districts.json';

// Define an interface for type safety
interface District {
    code: string;
    name: string;
    regency_code: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { regencyCode: string } }
) {
  const { regencyCode } = params;
  if (!regencyCode) {
    return NextResponse.json({ error: 'Regency code is required' }, { status: 400 });
  }

  try {
    // Filter districts from the local JSON file based on regencyCode
    const filteredDistricts = (allDistricts as District[]).filter(
        (district) => district.regency_code === regencyCode
    );
    return NextResponse.json(filteredDistricts);
  } catch (error) {
    console.error(`Error reading local districts data for regency ${regencyCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching districts', details: (error as Error).message }, { status: 500 });
  }
}
