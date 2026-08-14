import type { ComponentProps } from 'react';

import { Badge } from '@/components/ui/Badge';
import type { ShowStatus } from '@/features/shows/domain/show';

type ShowStatusBadgeProps = {
  status: ShowStatus;
};

const statusLabels: Record<ShowStatus, string> = {
  running: 'Running',
  ended: 'Ended',
  'to-be-determined': 'To Be Determined',
  unknown: 'Status Unknown',
};

const statusVariants: Record<ShowStatus, ComponentProps<typeof Badge>['variant']> = {
  running: 'success',
  ended: 'neutral',
  'to-be-determined': 'warning',
  unknown: 'neutral',
};

export function ShowStatusBadge({ status }: ShowStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}
