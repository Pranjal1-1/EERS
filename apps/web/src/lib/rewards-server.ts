import { randomUUID } from 'node:crypto';

export function createCertificateNumber(awardType: 'EMPLOYEE_OF_MONTH' | 'EMPLOYEE_OF_YEAR', year: number): string {
  const prefix = awardType === 'EMPLOYEE_OF_YEAR' ? 'EOY' : 'EOM';
  return `EERS-${prefix}-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
