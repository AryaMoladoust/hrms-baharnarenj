'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ownerFetch } from '@/lib/owner/client';

// Loads GET /api/owner/<path> (path may be null to wait). Returns { data, error, loading, reload }.
export function useOwnerData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const id = ++latest.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await ownerFetch(path);
      if (id === latest.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === latest.current) setState((prev) => ({ data: prev.data, error, loading: false }));
    }
  }, [path]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
