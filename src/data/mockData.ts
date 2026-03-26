import { UrgencyLevel } from '@/types';

export const urgencyConfig: Record<UrgencyLevel, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '142 71% 45%' },
  medium: { label: 'Média', color: '45 93% 47%' },
  critical: { label: 'Crítica', color: '25 95% 53%' },
  critical24h: { label: 'Crítica 24h', color: '0 84% 60%' },
  report: { label: 'Reportar', color: '220 9% 46%' },
};
