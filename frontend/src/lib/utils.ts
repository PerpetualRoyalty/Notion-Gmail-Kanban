import { Priority } from '../types/kanban';

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high:   'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:    'bg-green-100 text-green-700 border-green-200',
};

export const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  notion: { label: 'Notion', color: 'bg-gray-900 text-white' },
  gmail:  { label: 'Gmail',  color: 'bg-red-500 text-white' },
  manual: { label: 'Manual', color: 'bg-blue-500 text-white' },
};

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return `⚠ Overdue ${Math.abs(diff)}d`;
  if (diff === 0) return '🔥 Due today';
  if (diff <= 3) return `⏰ ${diff}d left`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
