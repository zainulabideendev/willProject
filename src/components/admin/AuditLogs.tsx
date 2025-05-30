import React from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  details: any;
  created_at: string;
  ip_address: string;
  user_agent: string;
  admin: {
    full_name: string;
  };
}

export function AuditLogs() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            admin:profiles(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#2D2D2D]">Audit Logs</h2>
        <p className="text-sm text-[#2D2D2D]/60">Showing last 100 activities</p>
      </div>

      <div className="overflow-hidden rounded-lg shadow" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                  {log.admin?.full_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                  <pre className="font-mono text-xs">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}