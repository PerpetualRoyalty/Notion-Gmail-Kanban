import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  notionConnected: boolean;
  gmailConnected: boolean;
  lastSync: string | null;
  syncing: boolean;
  onRefresh: () => void;
}

export default function StatusBar({ notionConnected, gmailConnected, lastSync, syncing, onRefresh }: Props) {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-500 bg-white border-b px-6 py-2">
      <div className="flex items-center gap-1.5">
        {notionConnected ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-400" />}
        <span className={notionConnected ? 'text-green-600 font-medium' : 'text-red-500'}>Notion</span>
      </div>
      <div className="flex items-center gap-1.5">
        {gmailConnected ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-400" />}
        <span className={gmailConnected ? 'text-green-600 font-medium' : 'text-red-500'}>Gmail</span>
      </div>
      {lastSync && (
        <span className="text-gray-400">Last sync: {new Date(lastSync).toLocaleTimeString()}</span>
      )}
      <button
        onClick={onRefresh}
        className={clsx('ml-auto flex items-center gap-1 text-blue-500 hover:text-blue-700', syncing && 'animate-spin')}
      >
        <RefreshCw size={12} />
        {syncing ? 'Syncing...' : 'Refresh'}
      </button>
    </div>
  );
}
