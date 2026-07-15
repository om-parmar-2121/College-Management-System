import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

export function useTableQuery(table: string, options?: {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [table, options?.filters, options?.orderBy, options?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      if (options?.orderBy) {
        params.append('sortBy', options.orderBy.column);
        params.append('sortOrder', options.orderBy.ascending ? 'asc' : 'desc');
      }
      if (options?.limit) {
        params.append('limit', String(options.limit));
      }

      const url = `${API_BASE}/${table}?${params.toString()}`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error fetching data');
      }
      return res.json();
    },
    enabled: options?.enabled !== false,
  });
}

export function useTableMutation(table: string) {
  const queryClient = useQueryClient();

  const insert = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const res = await fetch(`${API_BASE}/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error inserting data');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      // Invalidate analytics queries as well to keep charts in sync
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, any> }) => {
      const res = await fetch(`${API_BASE}/${table}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error updating data');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${table}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error deleting data');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  return { insert, update, remove };
}

