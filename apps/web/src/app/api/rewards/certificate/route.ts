import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/api-auth';
import { createCertificateNumber } from '../../../../lib/rewards-server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  let user;
  try { user = await requireUser(); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); throw error; }
  const p = new URL(request.url).searchParams;
  const awardType = p.get('awardType');
  const yearRaw = p.get('year');
  if (awardType !== 'EMPLOYEE_OF_MONTH' && awardType !== 'EMPLOYEE_OF_YEAR') return NextResponse.json({ error: 'Valid awardType is required' }, { status: 422 });
  const year = Number(yearRaw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return NextResponse.json({ error: 'Valid year is required' }, { status: 422 });
  return NextResponse.json({ data: { certificateNumber: createCertificateNumber(awardType, year), requestedBy: user.id } });
}
