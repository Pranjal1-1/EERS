export type AwardWorkflowStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FINALIZED';
export type AwardRole = 'MANAGER' | 'HR' | 'MD' | 'CEO' | 'ADMIN';

const APPROVAL_ORDER: AwardRole[] = ['MANAGER', 'HR', 'MD', 'CEO'];

export type AwardWorkflow = {
  id: string;
  status: AwardWorkflowStatus;
  currentApprover: AwardRole;
  approvals: Partial<Record<AwardRole, { approvedAt: string; actorId: string }>>;
  rejectionReason?: string;
  finalizedAt?: string;
  finalizedBy?: string;
};

export function submitAwardForReview(workflow: AwardWorkflow): AwardWorkflow {
  if (workflow.status !== 'DRAFT' && workflow.status !== 'REJECTED') throw new Error('Only draft or rejected awards can be submitted');
  return { ...workflow, status: 'PENDING_REVIEW', currentApprover: 'MANAGER', rejectionReason: undefined };
}

export function approveAward(workflow: AwardWorkflow, actorId: string, role: AwardRole): AwardWorkflow {
  if (workflow.status !== 'PENDING_REVIEW') throw new Error('Award is not awaiting approval');
  if (role !== 'ADMIN' && role !== workflow.currentApprover) throw new Error('Actor is not the current approver');
  if (!actorId.trim()) throw new Error('Actor ID is required');
  if (role === 'ADMIN') return { ...workflow, status: 'APPROVED', approvals: { ...workflow.approvals, ADMIN: { actorId, approvedAt: new Date().toISOString() } } };
  const approvals = { ...workflow.approvals, [role]: { actorId, approvedAt: new Date().toISOString() } };
  const index = APPROVAL_ORDER.indexOf(role);
  const nextRole = APPROVAL_ORDER[index + 1];
  return nextRole ? { ...workflow, approvals, currentApprover: nextRole } : { ...workflow, approvals, status: 'APPROVED' };
}

export function rejectAward(workflow: AwardWorkflow, actorId: string, role: AwardRole, reason: string): AwardWorkflow {
  if (workflow.status !== 'PENDING_REVIEW') throw new Error('Award is not awaiting approval');
  if (role !== 'ADMIN' && role !== workflow.currentApprover) throw new Error('Actor is not the current approver');
  if (!reason.trim()) throw new Error('Rejection reason is required');
  return { ...workflow, status: 'REJECTED', rejectionReason: reason.trim() };
}

export function finalizeAward(workflow: AwardWorkflow, actorId: string, role: AwardRole): AwardWorkflow {
  if (workflow.status !== 'APPROVED') throw new Error('Only approved awards can be finalized');
  if (!actorId.trim()) throw new Error('Actor ID is required');
  if (role !== 'ADMIN' && role !== 'CEO' && role !== 'MD') throw new Error('Only MD, CEO, or Admin can finalize awards');
  if (workflow.finalizedAt) throw new Error('Award is already finalized');
  return { ...workflow, status: 'FINALIZED', finalizedBy: actorId, finalizedAt: new Date().toISOString() };
}
