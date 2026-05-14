'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'read_notification_ids';

export function useReadTracker() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setReadIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const isRead = (id: string) => readIds.has(id);

  return { markAsRead, isRead };
}
