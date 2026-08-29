import type { EmployeeRecord } from '../persistence-model';
import { createSqlExecutor, type SqlExecutor } from '../db/sql';
import type { EmployeeRepository } from '../repositories';

function mapEmployee(row: Record<string, unknown>): EmployeeRecord {
  return {
    id: String(row.id),
    employeeCode: String(row.employee_code),
    name: String(row.name),
    email: String(row.email),
    departmentId: String(row.department_id),
    role: String(row.role),
    active: Boolean(row.active),
  };
}

export class PostgresEmployeeRepository implements EmployeeRepository {
  constructor(private readonly sql: SqlExecutor = createSqlExecutor()) {}

  async list(): Promise<EmployeeRecord[]> {
    const rows = await this.sql<Record<string, unknown>>(`SELECT id, employee_code, name, email, department_id, role, active FROM employees ORDER BY name ASC`);
    return rows.map(mapEmployee);
  }

  async findById(id: string): Promise<EmployeeRecord | null> {
    const rows = await this.sql<Record<string, unknown>>(`SELECT id, employee_code, name, email, department_id, role, active FROM employees WHERE id = $1 LIMIT 1`, [id]);
    return rows[0] ? mapEmployee(rows[0]) : null;
  }

  async save(employee: EmployeeRecord): Promise<EmployeeRecord> {
    const rows = await this.sql<Record<string, unknown>>(`INSERT INTO employees (id, employee_code, name, email, department_id, role, active) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET employee_code=EXCLUDED.employee_code, name=EXCLUDED.name, email=EXCLUDED.email, department_id=EXCLUDED.department_id, role=EXCLUDED.role, active=EXCLUDED.active RETURNING id, employee_code, name, email, department_id, role, active`, [employee.id, employee.employeeCode, employee.name, employee.email, employee.departmentId, employee.role, employee.active]);
    if (!rows[0]) throw new Error('Employee persistence failed');
    return mapEmployee(rows[0]);
  }
}
