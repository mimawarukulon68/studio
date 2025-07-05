
import { type NextRequest, NextResponse } from 'next/server';
import allRegencies from '@/data/wilayah/regencies.json';

// Define an interface for type safety
interface Regency {
    code: string;
    name: string;
    province_code: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provinceCode: string } }
) {
  const { provinceCode } = params;
  if (!provinceCode) {
    return NextResponse.json({ error: 'Province code is required' }, { status: 400 });
  }

  try {
    // Filter regencies from the local JSON file based on provinceCode
    const filteredRegencies = (allRegencies as Regency[]).filter(
        (regency) => regency.province_code === provinceCode
    );
    return NextResponse.json(filteredRegencies);
  } catch (error) {
    console.error(`Error reading local regencies data for province ${provinceCode}:`, error);
    return NextResponse.json({ error: 'Internal server error fetching regencies', details: (error as Error).message }, { status: 500 });
  }
}
