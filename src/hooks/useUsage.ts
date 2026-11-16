import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getClientId } from '@/lib/clientId';

export interface UsageStatus {
  message_count: number;
  limit: number;
  remaining: number;
  plan: 'free' | 'premium';
}

interface UseUsageReturn {
  usage: UsageStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useUsage(): UseUsageReturn {
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const clientId = getClientId();
    const { data, error } = await supabase.rpc('get_usage_status', {
      p_client_id: clientId,
    });

    if (error || !data) {
      // Default to free plan with full quota
      setUsage({
        message_count: 0,
        limit: 20,
        remaining: 20,
        plan: 'free',
      });
      setLoading(false);
      return;
    }

    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    setUsage(parsed as UsageStatus);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, loading, refresh };
}
