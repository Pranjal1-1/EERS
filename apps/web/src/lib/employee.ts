export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string | null;
  designation: string | null;
  managerId: string | null;
  joiningDate: string | null;
  status: EmployeeStatus;
};

export type CreateEmployeeInput = Omit<Employee, 'id' | 'status'> & { status?: EmployeeStatus };

export function validateCreateEmployee(input: CreateEmployeeInput): string[] {
  const errors: string[] = [];
  if (!input.employeeId.trim()) errors.push('Employee ID is required');
  if (!input.firstName.trim()) errors.push('First name is required');
  if (!input.lastName.trim()) errors.push('Last name is required');
  if (!/^\S+@\S+\.\S+$/.test(input.email)) errors.push('A valid company email is required');
  return errors;
}
