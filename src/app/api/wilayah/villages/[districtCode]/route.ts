
import { type NextRequest, NextResponse } from 'next/server';
import allVillages from '@/data/wilayah/villages.json';

// Define an interface for type safety
interface Village {
    code: string;
    name: string;
    district_code: string;
    postal_code: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { districtCode: string } }
) {
  const { districtCode } = params;
  if (!districtCode) {
    return NextResponse.json({ error: 'District code is required' }, { status: 400 });
  }

  try {
    // Filter villages from the local JSON file based on districtCode
    const filteredVillages = (allVillages as Village[]).filter(
        (village) => village.district_code === districtCode
    );
    return NextResponse.json(filteredVillages);
  } catch (error) {
    console.error(`Error reading local villages data for district ${districtCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching villages', details: (error as Error).message }, { status: 500 });
  }
}
