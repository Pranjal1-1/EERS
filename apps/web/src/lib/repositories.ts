import type { EmployeeRecord, MonthlyPerformanceRecord, AwardRecord, BonusRecord, CertificateRecord } from './persistence-model';

export interface EmployeeRepository {
  list(): Promise<EmployeeRecord[]>;
  findById(id: string): Promise<EmployeeRecord | null>;
  save(employee: EmployeeRecord): Promise<EmployeeRecord>;
}

export interface PerformanceRepository {
  saveSnapshot(snapshot: MonthlyPerformanceRecord): Promise<MonthlyPerformanceRecord>;
  findByEmployeeAndCycle(employeeId: string, cycle: string): Promise<MonthlyPerformanceRecord | null>;
}

export interface AwardRepository {
  save(award: AwardRecord): Promise<AwardRecord>;
  findByCycle(cycle: string, awardType: AwardRecord['awardType']): Promise<AwardRecord[]>;
}

export interface RewardRepository {
  saveBonus(bonus: BonusRecord): Promise<BonusRecord>;
  saveCertificate(certificate: CertificateRecord): Promise<CertificateRecord>;
}
