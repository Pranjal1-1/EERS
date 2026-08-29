import type { KpiDefinition } from './kpi';

export type DepartmentKpiTemplate = {
  departmentId: string;
  departmentName: string;
  kpis: KpiDefinition[];
};

export const DEFAULT_DEPARTMENT_KPI_TEMPLATES: DepartmentKpiTemplate[] = [
  { departmentId: 'SALES_PRE', departmentName: 'Sales & Presales', kpis: [
    { id: 'sales-revenue', name: 'Revenue Achievement', target: 100, weight: 35 },
    { id: 'sales-conversion', name: 'Lead / Proposal Conversion', target: 100, weight: 25 },
    { id: 'sales-followup', name: 'Lead & Client Follow-up', target: 100, weight: 20 },
    { id: 'sales-new-business', name: 'New Business Contribution', target: 100, weight: 20 },
  ]},
  { departmentId: 'ENG_SERVICE', departmentName: 'Installation / Engineering & Service', kpis: [
    { id: 'eng-delivery', name: 'On-time Project / Installation Delivery', target: 100, weight: 30 },
    { id: 'eng-quality', name: 'Installation & Technical Quality', target: 100, weight: 30 },
    { id: 'eng-response', name: 'Service Response & Resolution', target: 100, weight: 25 },
    { id: 'eng-client', name: 'Client Satisfaction', target: 100, weight: 15 },
  ]},
  { departmentId: 'PAYMENT', departmentName: 'Payment Follow-up', kpis: [
    { id: 'payment-collection', name: 'Collection Achievement', target: 100, weight: 35 },
    { id: 'payment-followup', name: 'Outstanding Follow-up Completion', target: 100, weight: 25 },
    { id: 'payment-ageing', name: 'Ageing Reduction', target: 100, weight: 25 },
    { id: 'payment-reporting', name: 'Reporting Accuracy & Timeliness', target: 100, weight: 15 },
  ]},
];

export function validateDepartmentTemplate(template: DepartmentKpiTemplate): void {
  if (!template.departmentId || !template.departmentName.trim()) throw new Error('Department identity is required');
  const total = template.kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
  if (total !== 100) throw new Error(`KPI weights for ${template.departmentName} must total 100; received ${total}`);
}
