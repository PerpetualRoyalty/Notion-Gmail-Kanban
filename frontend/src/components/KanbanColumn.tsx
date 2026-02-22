import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, KanbanCard } from '../types/kanban';
import KanbanCardComponent from './KanbanCard';
import clsx from 'clsx';

const COLUMN_COLORS: Record<string, string> = {
  inbox:       'bg-gray-50 border-gray-200',
  'in-progress': 'bg-blue-50 border-blue-200',
  review:      'bg-purple-50 border-purple-200',
  done:        'bg-green-50 border-green-200',
};

const HEADER_COLORS: Record<string, string> = {
  inbox:         'text-gray-600',
  'in-progress': 'text-blue-600',
  review:        'text-purple-600',
  done:          'text-green-600',
};

interface Props {
  column: Column;
  onCardClick: (card: KanbanCard) => void;
}

export default function KanbanColumn({ column, onCardClick }: Props) {
  return (
    <div className={clsx('flex flex-col rounded-xl border-2 min-w-[260px] w-72 flex-shrink-0', COLUMN_COLORS[column.id])}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className={clsx('font-semibold text-sm flex items-center gap-2', HEADER_COLORS[column.id])}>
          <span>{column.emoji}</span>
          <span>{column.label}</span>
        </h3>
        <span className="bg-white text-gray-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border">
          {column.cards.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              'flex-1 px-3 pb-3 space-y-2 min-h-[200px] transition-colors rounded-b-xl',
              snapshot.isDraggingOver && 'bg-white/60'
            )}
          >
            {column.cards.map((card, i) => (
              <KanbanCardComponent key={card.id} card={card} index={i} onClick={onCardClick} />
            ))}
            {provided.placeholder}
            {column.cards.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-gray-400 text-center pt-6">Drop cards here</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
