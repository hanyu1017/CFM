// src/hooks/useDialog.ts
'use client';

import { useState, useCallback } from 'react';

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ConfirmDialogState extends DialogState {
  onConfirm: () => void;
}

// 用於 ConfirmDialog
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      type: 'info' | 'success' | 'warning' | 'error' = 'warning'
    ) => {
      setState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm,
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmState: state,
    showConfirm,
    closeConfirm,
  };
}

// 用於 AlertDialog
export function useAlertDialog() {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info'
    ) => {
      setState({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertState: state,
    showAlert,
    closeAlert,
  };
}

// 用於 Toast
interface ToastState {
  isOpen: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      setState({
        isOpen: true,
        message,
        type,
      });
    },
    []
  );

  const closeToast = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toastState: state,
    showToast,
    closeToast,
  };
}
