import React from 'react';
import { Users, Trash2, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import './ExecutorList.css';

interface Executor {
  id: string;
  title: string;
  first_names: string;
  last_name: string;
  email: string;
  phone: string;
}

interface ExecutorListProps {
  profileId: string;
  selectedFirm: any;
  onExecutorDeleted: () => void;
}

export function ExecutorList({ profileId, selectedFirm, onExecutorDeleted }: ExecutorListProps) {
  const [executors, setExecutors] = React.useState<Executor[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchExecutors = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('executors')
        .select('*')
        .eq('profile_id', profileId)
        .order('executor_order');

      if (error) throw error;
      setExecutors(data || []);
    } catch (error) {
      console.error('Error fetching executors:', error);
      toast.error('Failed to load executors');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  React.useEffect(() => {
    fetchExecutors();
  }, [fetchExecutors]);

  const handleDelete = async (executorId: string) => {
    try {
      const { error } = await supabase
        .from('executors')
        .delete()
        .eq('id', executorId);

      if (error) throw error;

      toast.success('Executor removed successfully');
      onExecutorDeleted();
      await fetchExecutors();
    } catch (error) {
      console.error('Error removing executor:', error);
      toast.error('Failed to remove executor');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (executors.length === 0 && !selectedFirm) {
    return null;
  }

  return (
    <div className="executor-list-container">
      <h3 className="executor-list-title">Added Executors</h3>
      {selectedFirm && (
        <div className="executor-card">
          <div className="executor-icon">
            <Building2 />
          </div>
          <div className="executor-details">
            <h4 className="executor-name">{selectedFirm.name}</h4>
            <p className="executor-email">{selectedFirm.contact_email}</p>
          </div>
        </div>
      )}
      {executors.map((executor) => (
        <div
          key={executor.id}
          className="executor-card"
        >
          <div className="executor-icon">
            <Users />
          </div>
          <div className="executor-details">
            <h4 className="executor-name">
              {executor.first_names} {executor.last_name}
            </h4>
            <p className="executor-email">
              {executor.email}
            </p>
          </div>
          <button
            onClick={() => handleDelete(executor.id)}
            className="delete-button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}