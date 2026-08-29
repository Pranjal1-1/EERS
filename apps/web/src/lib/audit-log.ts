export type AuditAction = 'ATTENDANCE_IMPORT' | 'KPI_CHANGE' | 'REVIEW_SUBMIT' | 'REVIEW_APPROVE' | 'AWARD_FINALIZE' | 'AWARD_OVERRIDE' | 'BONUS_UPDATE' | 'CERTIFICATE_ISSUE' | 'SETTINGS_CHANGE';

export type AuditEvent = {
  id: string;
  action: AuditAction;
  actorUserId: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export function createAuditEvent(input: Omit<AuditEvent, 'id' | 'occurredAt'>): AuditEvent {
  if (!input.actorUserId || !input.targetType || !input.targetId) throw new Error('Audit actor and target are required');
  return { ...input, id: crypto.randomUUID(), occurredAt: new Date().toISOString() };
}
