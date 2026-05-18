import React from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function ConversationHistory({ conversations, activeId, onSelect, onDelete, onNew, language }) {
  const isAr = language === 'ar';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--mizan-surface)' }}>
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--mizan-border)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
          {isAr ? 'المحادثات' : 'Conversations'}
        </p>
        <button onClick={onNew}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? 'لا توجد محادثات' : 'No conversations yet'}
          </p>
        )}
        {conversations.map(conv => (
          <div key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
            style={{
              background: activeId === conv.id ? 'var(--mizan-emerald)18' : 'transparent',
              border: `1px solid ${activeId === conv.id ? 'var(--mizan-emerald)40' : 'transparent'}`,
            }}>
            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: activeId === conv.id ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--mizan-text)' }}>
                {conv.title || (isAr ? 'محادثة جديدة' : 'New conversation')}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                {conv.preview || '...'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.6 }}>
                {conv.createdAt ? format(new Date(conv.createdAt), 'MMM d') : ''}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: 'var(--mizan-red)' }}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}