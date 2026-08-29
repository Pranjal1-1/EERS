import { NextResponse } from 'next/server';
import { parseAttendanceCsv } from '@/lib/attendance-csv';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('text/csv')) {
    return NextResponse.json({ error: 'Preview currently accepts text/csv. Excel binary parsing is planned for the import adapter.' }, { status: 415 });
  }

  const csv = await request.text();
  const result = parseAttendanceCsv(csv);
  return NextResponse.json({ data: result });
}
