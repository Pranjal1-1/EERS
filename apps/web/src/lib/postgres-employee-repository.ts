import type { EmployeeRecord } from './persistence-model';
import { assertServerDatabaseAccess } from './db';
import { pool } from './postgres';
import type { EmployeeRepository } from './repositories';

type EmployeeRow = {
  id: string;
  employee_code: string;
  name: string;
  email: string;
  department_id: string;
  role: string;
  active: boolean;
};

function toEmployee(row: EmployeeRow): EmployeeRecord {
  return { id: row.id, employeeCode: row.employee_code, name: row.name, email: row.email, departmentId: row.department_id, role: row.role, active: row.active };
}

export class PostgresEmployeeRepository implements EmployeeRepository {
  constructor() { assertServerDatabaseAccess(); }

  async list(): Promise<EmployeeRecord[]> {
    const result = await pool.query<EmployeeRow>(`SELECT id, employee_code, name, email, department_id, role, active FROM employees ORDER BY name ASC`);
    return result.rows.map(toEmployee);
  }

  async findById(id: string): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRow>(`SELECT id, employee_code, name, email, department_id, role, active FROM employees WHERE id = $1`, [id]);
    return result.rows[0] ? toEmployee(result.rows[0]) : null;
  }

  async save(employee: EmployeeRecord): Promise<EmployeeRecord> {
    const result = await pool.query<EmployeeRow>(`INSERT INTO employees (id, employee_code, name, email, department_id, role, active) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET employee_code = EXCLUDED.employee_code, name = EXCLUDED.name, email = EXCLUDED.email, department_id = EXCLUDED.department_id, role = EXCLUDED.role, active = EXCLUDED.active RETURNING id, employee_code, name, email, department_id, role, active`, [employee.id, employee.employeeCode, employee.name, employee.email, employee.departmentId, employee.role, employee.active]);
    return toEmployee(result.rows[0]);
  }
}
