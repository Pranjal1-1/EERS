export type ReviewType = 'MANAGER' | 'PROJECT' | 'CLIENT';
export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type PerformanceReview = {
  id: string;
  employeeId: string;
  reviewerId: string;
  type: ReviewType;
  score: number;
  comment: string;
  evidence?: string;
  status: ReviewStatus;
  createdAt: string;
};

export function validateReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): void {
  if (!review.employeeId || !review.reviewerId) throw new Error('Employee and reviewer are required');
  if (!Number.isFinite(review.score) || review.score < 0 || review.score > 100) throw new Error('Review score must be between 0 and 100');
  if (!review.comment.trim()) throw new Error('A review comment is required');
  if (review.status === 'SUBMITTED' && review.comment.trim().length < 10) throw new Error('Submitted reviews need meaningful comments');
}

export function submitReview(review: PerformanceReview): PerformanceReview {
  validateReview(review);
  if (review.status !== 'DRAFT') throw new Error('Only draft reviews can be submitted');
  return { ...review, status: 'SUBMITTED' };
}

export function approveReview(review: PerformanceReview, approverRole: string): PerformanceReview {
  if (!['MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'].includes(approverRole)) throw new Error('Unauthorized review approval');
  if (review.status !== 'SUBMITTED') throw new Error('Only submitted reviews can be approved');
  return { ...review, status: 'APPROVED' };
}
