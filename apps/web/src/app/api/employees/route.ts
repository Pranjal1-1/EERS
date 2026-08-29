import { NextResponse } from 'next/server';
import { employeeRepository } from '@/lib/store';
import { validateCreateEmployee, type CreateEmployeeInput } from '@/lib/employee';

export async function GET() {
  return NextResponse.json({ data: await employeeRepository.list() });
}

export async function POST(request: Request) {
  let body: CreateEmployeeInput;
  try {
    body = await request.json() as CreateEmployeeInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const errors = validateCreateEmployee(body);
  if (errors.length) return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 422 });

  const employee = await employeeRepository.create(body);
  return NextResponse.json({ data: employee }, { status: 201 });
}
