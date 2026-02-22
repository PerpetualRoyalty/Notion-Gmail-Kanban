import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanCard as CardType } from '../types/kanban';
import { PRIORITY_COLORS, SOURCE_LABELS, formatDate, isOverdue } from '../lib/utils';
import { Calendar, User } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  card: CardType;
  index: number;
  onClick: (card: CardType) => void;
}

export default function KanbanCard({ card, index, onClick }: Props) {
  const overdue = isOverdue(card.dueDate);
  const source = SOURCE_LABELS[card.source] || SOURCE_LABELS.manual;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={clsx(
            'bg-white rounded-lg border p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow',
            snapshot.isDragging && 'shadow-lg rotate-1 opacity-90',
            overdue && 'border-red-300'
          )}
        >
          {/* Source badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', source.color)}>
              {source.label}
            </span>
            <span className={clsx(
              'text-xs font-medium px-2 py-0.5 rounded-full border capitalize',
              PRIORITY_COLORS[card.priority]
            )}>
              {card.priority}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-gray-800 leading-snug mb-2">{card.title}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {card.dueDate && (
              <span className={clsx('flex items-center gap-1', overdue && 'text-red-500 font-semibold')}>
                <Calendar size={11} />
                {formatDate(card.dueDate)}
              </span>
            )}
            {card.assignee && (
              <span className="flex items-center gap-1">
                <User size={11} />
                {card.assignee.replace(/<.*>/, '').trim()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
