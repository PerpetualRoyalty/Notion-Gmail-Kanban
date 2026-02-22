import React from 'react';
import { KanbanCard, Priority, Status } from '../types/kanban';
import { X, ExternalLink } from 'lucide-react';
import { PRIORITY_COLORS, SOURCE_LABELS } from '../lib/utils';
import clsx from 'clsx';

const STATUSES: { value: Status; label: string }[] = [
  { value: 'inbox', label: '📥 Inbox' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'review', label: '👁 Review' },
  { value: 'done', label: '✅ Done' },
];

interface Props {
  card: KanbanCard;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
}

export default function CardModal({ card, onClose, onStatusChange }: Props) {
  const source = SOURCE_LABELS[card.source];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={clsx('text-xs font-semibold px-2 py-1 rounded-full', source.color)}>{source.label}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{card.title}</h2>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Priority</p>
            <span className={clsx('px-2 py-0.5 rounded-full border text-xs font-medium capitalize', PRIORITY_COLORS[card.priority])}>
              {card.priority}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Due Date</p>
            <p className="text-gray-700">{card.dueDate || '—'}</p>
          </div>
          {card.assignee && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Assignee</p>
              <p className="text-gray-700 truncate">{card.assignee}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Last Synced</p>
            <p className="text-gray-500 text-xs">{new Date(card.lastSynced).toLocaleString()}</p>
          </div>
        </div>

        {/* Status change */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Move To</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { onStatusChange(card.id, s.value); onClose(); }}
                className={clsx(
                  'py-2 px-3 rounded-lg text-sm border transition-colors',
                  card.status === s.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* External links */}
        <div className="flex gap-3">
          {card.notionPageId && (
            <a
              href={`https://notion.so/${card.notionPageId.replace(/-/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black"
            >
              <ExternalLink size={12} /> Open in Notion
            </a>
          )}
          {card.gmailThreadId && (
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${card.gmailThreadId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
            >
              <ExternalLink size={12} /> Open in Gmail
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
