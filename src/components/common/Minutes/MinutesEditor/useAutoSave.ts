/**
 * useAutoSave Hook
 * Custom hook for auto-saving editor content with debouncing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

interface UseAutoSaveOptions {
  onSave: (content: string) => Promise<void> | void;
  interval?: number; // milliseconds, default 30000 (30 seconds)
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  error: Error | null;
  saveNow: (content: string) => Promise<void>;
  resetError: () => void;
}

export const useAutoSave = ({
  onSave,
  interval = 30000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Immediate save function
  const saveNow = useCallback(async (content: string) => {
    if (!content || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save'));
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      await saveNow(content);
    }, interval),
    [saveNow, interval]
  );

  // Reset error
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    lastSaved,
    isSaving,
    error,
    saveNow,
    resetError,
  };
};

export default useAutoSave;
