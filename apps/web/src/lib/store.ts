import type { CreateEmployeeInput, Employee } from './employee';
import { hashPassword } from './auth';
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
  async create(input: CreateEmployeeInput): Promise<Employee> {
    const employee: Employee = { ...input, id: crypto.randomUUID(), status: input.status ?? 'ACTIVE' };
    this.employees.push(employee);
    return employee;
  }
}

export class PostgresEmployeeRepository implements EmployeeRepository {
  private readonly pool: Pool;
  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  }

  async list(): Promise<Employee[]> {
    const { rows } = await this.pool.query(`
      SELECT e.id, e.employee_id, e.first_name, e.last_name, u.email,
             e.department_id, e.designation, e.manager_id, e.joining_date, e.status
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.first_name, e.last_name
    `);
    return rows.map(this.mapRow);
  }

  async getById(id: string): Promise<Employee | null> {
    const { rows } = await this.pool.query(`
      SELECT e.id, e.employee_id, e.first_name, e.last_name, u.email,
             e.department_id, e.designation, e.manager_id, e.joining_date, e.status
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      WHERE e.id = $1 LIMIT 1
    `, [id]);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [input.email]);
      if (existing.rows[0]) throw Object.assign(new Error('A user with this email already exists'), { code: '23505' });

      // Provision a random, unusable-until-shared temporary credential for the employee account.
      const temporaryPassword = `EERS-${crypto.randomUUID()}-Temp!`;
      const passwordHash = hashPassword(temporaryPassword);
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'EMPLOYEE') RETURNING id`,
        [input.email.trim().toLowerCase(), passwordHash]
      );
      const userId = userResult.rows[0].id;

      const { rows } = await client.query(`
        INSERT INTO employees
          (user_id, employee_id, first_name, last_name, phone, designation, department_id, manager_id, joining_date, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id, employee_id, first_name, last_name, designation, department_id, manager_id, joining_date, status
      `, [userId, input.employeeId, input.firstName, input.lastName, null, input.designation, input.departmentId, input.managerId, input.joiningDate, input.status ?? 'ACTIVE']);
      await client.query('COMMIT');
      return this.mapRow({ ...rows[0], email: input.email.trim().toLowerCase() });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapRow(row: any): Employee {
    return {
      id: row.id,
      employeeId: row.employee_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email ?? '',
      departmentId: row.department_id,
      designation: row.designation,
      managerId: row.manager_id,
      joiningDate: row.joining_date ? new Date(row.joining_date).toISOString().slice(0, 10) : null,
      status: row.status,
    };
  }
}

const databaseUrl = process.env.DATABASE_URL;
export const employeeRepository: EmployeeRepository = databaseUrl
  ? new PostgresEmployeeRepository(databaseUrl)
  : new InMemoryEmployeeRepository();
