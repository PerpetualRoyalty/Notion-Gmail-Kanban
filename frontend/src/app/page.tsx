'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column, KanbanCard, Status } from '../types/kanban';
import KanbanColumn from '../components/KanbanColumn';
import StatusBar from '../components/StatusBar';
import CardModal from '../components/CardModal';
import { fetchTasks, updateTaskStatus, createWebSocket } from '../lib/api';

const COLUMN_DEFS: { id: Status; label: string; emoji: string }[] = [
  { id: 'inbox',       label: 'Inbox',       emoji: '📥' },
  { id: 'in-progress', label: 'In Progress', emoji: '🔄' },
  { id: 'review',      label: 'Review',      emoji: '👁' },
  { id: 'done',        label: 'Done',        emoji: '✅' },
];

function buildColumns(cards: KanbanCard[]): Column[] {
  return COLUMN_DEFS.map((def) => ({
    ...def,
    cards: cards.filter((c) => c.status === def.id),
  }));
}

export default function KanbanPage() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [notionConnected, setNotionConnected] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const loadTasks = useCallback(async () => {
    setSyncing(true);
    try {
      const tasks = await fetchTasks();
      setCards(tasks);
      setNotionConnected(true);
      setLastSync(new Date().toISOString());
    } catch {
      setNotionConnected(false);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadTasks(); }, [loadTasks]);

  // WebSocket real-time updates
  useEffect(() => {
    const ws = createWebSocket((data) => {
      if (data.event === 'notion:sync' || data.event === 'notion:full-sync') {
        loadTasks();
      }
      if (data.event === 'gmail:new-email') {
        setTimeout(loadTasks, 3000); // slight delay for middleware to parse
      }
    });
    wsRef.current = ws;
    return () => ws.close();
  }, [loadTasks]);

  // Check Gmail auth status
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`)
      .then(r => r.json())
      .then(d => setGmailConnected(d.authenticated))
      .catch(() => setGmailConnected(false));
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Status;

    // Optimistic UI update
    setCards((prev) =>
      prev.map((c) => c.id === draggableId ? { ...c, status: newStatus } : c)
    );

    try {
      await updateTaskStatus(draggableId, newStatus);
      setLastSync(new Date().toISOString());
    } catch {
      // Rollback on failure
      setCards((prev) =>
        prev.map((c) => c.id === draggableId ? { ...c, status: source.droppableId as Status } : c)
      );
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    await updateTaskStatus(id, status);
    setLastSync(new Date().toISOString());
  };

  const columns = buildColumns(cards);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🗂 Kanban</h1>
          <p className="text-xs text-gray-400">Notion + Gmail • Live Sync</p>
        </div>
        <div className="flex gap-3">
          {!gmailConnected && (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
            >
              Connect Gmail
            </a>
          )}
          <span className="text-xs text-gray-400 self-center">{cards.length} tasks</span>
        </div>
      </header>

      {/* Sync status */}
      <StatusBar
        notionConnected={notionConnected}
        gmailConnected={gmailConnected}
        lastSync={lastSync}
        syncing={syncing}
        onRefresh={loadTasks}
      />

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {columns.map((col) => (
              <KanbanColumn key={col.id} column={col} onCardClick={setSelectedCard} />
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Card detail modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
