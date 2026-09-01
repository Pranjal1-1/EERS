import { NextResponse } from 'next/server';
import { employeeRepository } from '@/lib/store';
import { validateCreateEmployee, type CreateEmployeeInput } from '@/lib/employee';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ data: await employeeRepository.list() });
  } catch (error) {
    console.error('GET /api/employees failed', error);
    return NextResponse.json({ error: 'Unable to load employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: CreateEmployeeInput;
  try { body = await request.json() as CreateEmployeeInput; }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const errors = validateCreateEmployee(body);
  if (errors.length) return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 422 });

  try {
    const employee = await employeeRepository.create(body);
    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/employees failed', error);
    if (error?.code === '23505') return NextResponse.json({ error: 'Employee ID or email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create employee' }, { status: 500 });
  }
}
