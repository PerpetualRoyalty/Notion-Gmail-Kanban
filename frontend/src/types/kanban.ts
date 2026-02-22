export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'inbox' | 'in-progress' | 'review' | 'done';
export type Source = 'notion' | 'gmail' | 'manual';

export interface KanbanCard {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  source: Source;
  notionPageId?: string;
  gmailThreadId?: string;
  assignee?: string;
  lastSynced: string;
}

export interface Column {
  id: Status;
  label: string;
  emoji: string;
  cards: KanbanCard[];
}
