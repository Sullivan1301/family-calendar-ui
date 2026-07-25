import { EventStatus, UserStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: EventStatus | UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-tba-yellow/10 text-tba-yellow font-medium';
      case 'approved':
      case 'active':
        return 'bg-emerald-50 text-emerald-600 font-medium';
      case 'rejected':
        return 'bg-tba-red/8 text-tba-red font-medium';
      default:
        return 'bg-tba-surface text-tba-gray font-medium';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'active': return 'Actif';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs transition-all duration-200 animate-fade-in",
      getStatusStyles(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
}
