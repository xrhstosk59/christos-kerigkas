// src/hooks/useOfflineForm.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useOfflineQueue } from './useOffline';

export interface OfflineFormConfig<T> {
  storageKey: string;
  submitHandler: (data: T) => Promise<void>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  validateData?: (data: T) => string | null; // Return error message or null
  autosave?: boolean;
  autosaveDelay?: number;
}

export interface OfflineFormState<T> {
  data: T | null;
  isDirty: boolean;
  isSubmitting: boolean;
  lastSaved?: Date;
  error?: string;
}

/**
 * Hook for handling forms that work offline with auto-save and queue functionality
 */
export function useOfflineForm<T = Record<string, any>>(
  initialData: T,
  config: OfflineFormConfig<T>
) {
  const {
    storageKey,
    submitHandler,
    onSuccess,
    onError,
    validateData,
    autosave = true,
    autosaveDelay = 2000,
  } = config;

  const [state, setState] = useState<OfflineFormState<T>>({
    data: initialData,
    isDirty: false,
    isSubmitting: false,
  });

  const { addToQueue, processQueue, queueLength, isOnline } = useOfflineQueue<T>();

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          data: { ...initialData, ...parsed.data },
          lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : undefined,
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
  }, [storageKey, initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (!autosave || !state.isDirty || !state.data) return;

    const timeoutId = setTimeout(() => {
      if (state.data) {
        saveToStorage(state.data);
      }
    }, autosaveDelay);

    return () => clearTimeout(timeoutId);
  }, [state.data, state.isDirty, autosave, autosaveDelay]);

  // Process queue when coming online
  useEffect(() => {
    if (isOnline && queueLength > 0) {
      processQueue(submitHandler)
        .then(() => {
          // Clear saved data after successful submission
          clearSavedData();
        })
        .catch(error => {
          console.error('Failed to process offline queue:', error);
        });
    }
  }, [isOnline, queueLength, processQueue, submitHandler]);

  const saveToStorage = useCallback((data: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        lastSaved: new Date().toISOString(),
      }));
      setState(prev => ({
        ...prev,
        lastSaved: new Date(),
      }));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }, [storageKey]);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: undefined,
      }));
    } catch (error) {
      console.warn('Failed to clear saved data:', error);
    }
  }, [storageKey]);

  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setState(prev => {
      const currentData = prev.data || initialData;
      const newData = typeof updates === 'function' 
        ? updates(currentData)
        : { ...currentData, ...updates };
      
      return {
        ...prev,
        data: newData,
        isDirty: true,
        error: undefined,
      };
    });
  }, [initialData]);

  const submit = useCallback(async () => {
    if (!state.data) return;

    // Validate data
    if (validateData) {
      const validationError = validateData(state.data);
      if (validationError) {
        setState(prev => ({ ...prev, error: validationError }));
        return;
      }
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: undefined }));

    try {
      if (isOnline) {
        // Submit immediately if online
        await submitHandler(state.data);
        onSuccess?.(state.data);
        clearSavedData();
      } else {
        // Add to queue if offline
        addToQueue(state.data);
        onSuccess?.(state.data);
        // Keep saved data until successfully synced
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Submission failed');
      setState(prev => ({ ...prev, error: err.message }));
      onError?.(err, state.data);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.data, validateData, isOnline, submitHandler, onSuccess, onError, addToQueue, clearSavedData]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isDirty: false,
      isSubmitting: false,
    });
    clearSavedData();
  }, [initialData, clearSavedData]);

  const forceSave = useCallback(() => {
    if (state.data) {
      saveToStorage(state.data);
    }
  }, [state.data, saveToStorage]);

  return {
    ...state,
    updateData,
    submit,
    reset,
    forceSave,
    clearSavedData,
    isOnline,
    queueLength,
    hasPendingChanges: state.isDirty || queueLength > 0,
  };
}

/**
 * Hook for managing offline draft functionality
 */
export function useOfflineDraft<T>(
  key: string,
  initialData: T,
  autosaveDelay = 1000
) {
  const [data, setData] = useState<T>(initialData);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isDirty, setIsDirty] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({ ...initialData, ...parsed.data });
        setLastSaved(parsed.lastSaved ? new Date(parsed.lastSaved) : undefined);
      }
    } catch (error) {
      console.warn('Failed to load draft:', error);
    }
  }, [key, initialData]);

  // Auto-save draft
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`draft_${key}`, JSON.stringify({
          data,
          lastSaved: new Date().toISOString(),
        }));
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    }, autosaveDelay);

    return () => clearTimeout(timeoutId);
  }, [data, isDirty, key, autosaveDelay]);

  const updateDraft = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      setIsDirty(true);
      return newData;
    });
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${key}`);
      setData(initialData);
      setLastSaved(undefined);
      setIsDirty(false);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, [key, initialData]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify({
        data,
        lastSaved: new Date().toISOString(),
      }));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, [key, data]);

  return {
    data,
    lastSaved,
    isDirty,
    updateDraft,
    clearDraft,
    saveDraft,
  };
}