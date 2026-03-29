import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  getDocumentStatus,
  uploadPDF,
  askQuestion,
  clearDocument,
} from '../services/api';

// ── Document Status ────────────────────────────────────────
export const useDocumentStatus = () =>
  useQuery({
    queryKey: ['document-status'],
    queryFn: getDocumentStatus,
    staleTime: 0,
  });

export const useUploadPDF = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadPDF,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-status'] }),
  });
};

export const useClearDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-status'] }),
  });
};

export const useAskQuestion = () =>
  useMutation({ mutationFn: askQuestion });

// ── Reminders ─────────────────────────────────────────────
export const useReminders = (params) =>
  useQuery({
    queryKey: ['reminders', params],
    queryFn: () => getReminders(params),
    select: (data) => data.data,
  });

export const useCreateReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};

export const useUpdateReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateReminder(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};

export const useDeleteReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};

export const useToggleReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};
