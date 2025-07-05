
import { NextResponse } from 'next/server';
import provinces from '@/data/wilayah/provinces.json';

export async function GET() {
  try {
    // Return all provinces from the local JSON file
    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error reading local provinces data:', error);
    return NextResponse.json({ error: 'Internal server error fetching provinces', details: (error as Error).message }, { status: 500 });
  }
}
