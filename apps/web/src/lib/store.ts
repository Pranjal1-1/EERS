import type { CreateEmployeeInput, Employee } from './employee';

export interface EmployeeRepository {
  list(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | null>;
  create(input: CreateEmployeeInput): Promise<Employee>;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private employees: Employee[] = [];

  async list(): Promise<Employee[]> {
    return [...this.employees];
  }

  async getById(id: string): Promise<Employee | null> {
    return this.employees.find((employee) => employee.id === id) ?? null;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const employee: Employee = {
      ...input,
      id: crypto.randomUUID(),
      status: input.status ?? 'ACTIVE',
    };
    this.employees.push(employee);
    return employee;
  }
}

// Production wiring will replace this adapter with PostgreSQL without changing API consumers.
export const employeeRepository: EmployeeRepository = new InMemoryEmployeeRepository();
