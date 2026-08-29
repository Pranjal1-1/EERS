import type { CreateEmployeeInput, Employee } from './employee';
import { Pool } from 'pg';

export interface EmployeeRepository {
  list(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | null>;
  create(input: CreateEmployeeInput): Promise<Employee>;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private employees: Employee[] = [];
  async list(): Promise<Employee[]> { return [...this.employees]; }
  async getById(id: string): Promise<Employee | null> { return this.employees.find((employee) => employee.id === id) ?? null; }
  async create(input: CreateEmployeeInput): Promise<Employee> { const employee: Employee = { ...input, id: crypto.randomUUID(), status: input.status ?? 'ACTIVE' }; this.employees.push(employee); return employee; }
}

export class PostgresEmployeeRepository implements EmployeeRepository {
  private readonly pool: Pool;
  constructor(databaseUrl: string) { this.pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 }); }
  async list(): Promise<Employee[]> { const { rows } = await this.pool.query('SELECT id, employee_id, first_name, last_name, email, department_id, designation, manager_id, joining_date, status FROM employees ORDER BY first_name, last_name'); return rows.map(this.mapRow); }
  async getById(id: string): Promise<Employee | null> { const { rows } = await this.pool.query('SELECT id, employee_id, first_name, last_name, email, department_id, designation, manager_id, joining_date, status FROM employees WHERE id = $1 LIMIT 1', [id]); return rows[0] ? this.mapRow(rows[0]) : null; }
  async create(input: CreateEmployeeInput): Promise<Employee> { const { rows } = await this.pool.query('INSERT INTO employees (employee_id, first_name, last_name, email, department_id, designation, manager_id, joining_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, employee_id, first_name, last_name, email, department_id, designation, manager_id, joining_date, status', [input.employeeId, input.firstName, input.lastName, input.email, input.departmentId, input.designation, input.managerId, input.joiningDate, input.status ?? 'ACTIVE']); return this.mapRow(rows[0]); }
  private mapRow(row: any): Employee { return { id: row.id, employeeId: row.employee_id, firstName: row.first_name, lastName: row.last_name, email: row.email, departmentId: row.department_id, designation: row.designation, managerId: row.manager_id, joiningDate: row.joining_date ? new Date(row.joining_date).toISOString().slice(0, 10) : null, status: row.status }; }
}

const databaseUrl = process.env.DATABASE_URL;
export const employeeRepository: EmployeeRepository = databaseUrl ? new PostgresEmployeeRepository(databaseUrl) : new InMemoryEmployeeRepository();
