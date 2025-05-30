import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogOut, Users, FileText, Building2, BarChart as ChartBar, ClipboardList, Settings } from 'lucide-react';
import { AuditLogs } from '../components/admin/AuditLogs';
import { MetricDetails } from '../components/admin/MetricDetails';
import { PartnerManagement } from '../components/admin/PartnerManagement';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [showAuditLogs, setShowAuditLogs] = React.useState(false);
  const [showPartnerManagement, setShowPartnerManagement] = React.useState(false);
  const [selectedMetric, setSelectedMetric] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalChildren: 0,
    totalBeneficiaries: 0,
    totalMarried: 0,
    totalSingle: 0,
    totalWills: 0,
    totalPartnerFirms: 0,
    averageCompletion: 0,
    stepCompletion: {
      profileSetup: 0,
      assetsAdded: 0,
      beneficiariesChosen: 0,
      lastWishes: 0,
      executorChosen: 0,
      willReviewed: 0,
      willDownloaded: 0
    }
  });

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!navigator.onLine) {
          toast.error('No internet connection. Please check your connection and try again.');
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          toast.error('Authentication failed. Please try logging in again.');
          navigate('/admin/login');
          return;
        }

        if (!user) {
          navigate('/admin/login');
          return;
        }

        // First check if user exists in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast.error('Failed to verify admin access. Please try again.');
          navigate('/admin/login');
          return;
        }

        if (!profile || profile.role !== 'super_admin') {
          toast.error('Unauthorized access');
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Failed to verify admin access. Please try again.');
        navigate('/admin/login');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!navigator.onLine) {
        toast.error('No internet connection. Please check your connection and try again.');
        return;
      }

      try {
        setLoading(true);
        
        // Get total registered users
        const { data: userCount, error: userError } = await supabase
          .rpc('get_total_users');

        if (userError) throw userError;

        // Get total children
        const { data: childrenCount, error: childrenError } = await supabase
          .rpc('get_total_children');

        if (childrenError) throw childrenError;

        // Get total beneficiaries
        const { data: beneficiariesCount, error: beneficiariesError } = await supabase
          .rpc('get_total_beneficiaries');

        if (beneficiariesError) throw beneficiariesError;

        // Get total married users
        const { data: marriedCount, error: marriedError } = await supabase
          .rpc('get_total_married_users');

        if (marriedError) throw marriedError;

        // Get total single users
        const { data: singleCount, error: singleError } = await supabase
          .rpc('get_total_single_users');

        if (singleError) throw singleError;

        // Get total wills (profiles with will_reviewed = true)
        const { count: willCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('will_reviewed', true);

        // Get total partner firms
        const { count: firmCount } = await supabase
          .from('partner_firms')
          .select('*', { count: 'exact', head: true });

        // Get average completion score
        const { data: scores } = await supabase
          .from('estate_score')
          .select('total_score');

        const averageScore = scores?.reduce((acc, curr) => acc + curr.total_score, 0) || 0;
        const avgCompletion = scores?.length ? averageScore / scores.length : 0;

        // Get step completion stats
        const { data: stepStats, error: stepError } = await supabase
          .from('profiles')
          .select(`
            profile_setup_complete,
            assets_added,
            beneficiaries_chosen,
            last_wishes_documented,
            executor_chosen,
            will_reviewed,
            will_downloaded
          `);

        if (stepError) throw stepError;

        const totalProfiles = stepStats?.length || 0;
        const stepCompletion = {
          profileSetup: Math.round((stepStats?.filter(p => p.profile_setup_complete).length || 0) / totalProfiles * 100),
          assetsAdded: Math.round((stepStats?.filter(p => p.assets_added).length || 0) / totalProfiles * 100),
          beneficiariesChosen: Math.round((stepStats?.filter(p => p.beneficiaries_chosen).length || 0) / totalProfiles * 100),
          lastWishes: Math.round((stepStats?.filter(p => p.last_wishes_documented).length || 0) / totalProfiles * 100),
          executorChosen: Math.round((stepStats?.filter(p => p.executor_chosen).length || 0) / totalProfiles * 100),
         willReviewed: Math.round((stepStats?.filter(p => p.will_reviewed).length || 0) / totalProfiles * 100),
         willDownloaded: Math.round((stepStats?.filter(p => p.will_downloaded).length || 0) / totalProfiles * 100)
        };

        setStats({
          totalUsers: userCount,
          totalChildren: childrenCount,
          totalBeneficiaries: beneficiariesCount,
          totalMarried: marriedCount,
          totalSingle: singleCount,
          totalWills: willCount,
          totalPartnerFirms: firmCount,
          averageCompletion: Math.round(avgCompletion || 0),
          stepCompletion
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0047AB]/5 to-[#D4AF37]/5">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setShowAuditLogs(false);
              setShowPartnerManagement(!showPartnerManagement);
              setSelectedMetric(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#2D2D2D] hover:bg-gray-100 transition-colors mr-4"
          >
            <Building2 className="w-4 h-4" />
            Partner Management
          </button>
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#2D2D2D] hover:bg-gray-100 transition-colors mr-4"
          >
            <ClipboardList className="w-4 h-4" />
            Audit Logs
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#2D2D2D] hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        {showAuditLogs ? (
          <AuditLogs />
        ) : showPartnerManagement ? (
          <PartnerManagement />
        ) : selectedMetric ? (
          <MetricDetails 
            metric={selectedMetric} 
            onBack={() => setSelectedMetric(null)} 
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                loading={loading}
                onClick={() => setSelectedMetric('users')}
              />
              <StatCard
                title="Total Children"
                value={stats.totalChildren}
                icon={Users}
                loading={loading}
                onClick={() => setSelectedMetric('children')}
              />
              <StatCard
                title="Total Beneficiaries"
                value={stats.totalBeneficiaries}
                icon={Users}
                loading={loading}
                onClick={() => setSelectedMetric('beneficiaries')}
              />
              <StatCard
                title="Married Users"
                value={stats.totalMarried}
                icon={Users}
                loading={loading}
                onClick={() => setSelectedMetric('married')}
              />
              <StatCard
                title="Single Users"
                value={stats.totalSingle}
                icon={Users}
                loading={loading}
                onClick={() => setSelectedMetric('single')}
              />
              <StatCard
                title="Completed Wills"
                value={stats.totalWills}
                icon={FileText}
                loading={loading}
                onClick={() => setSelectedMetric('wills')}
              />
              <StatCard
                title="Partner Firms"
                value={stats.totalPartnerFirms}
                icon={Building2}
                loading={loading}
                onClick={() => setSelectedMetric('partners')}
              />
              <StatCard
                title="Avg. Completion"
                value={`${stats.averageCompletion}%`}
                icon={ChartBar}
                loading={loading}
                onClick={() => setSelectedMetric('completion')}
              />
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-[#2D2D2D]">Step Completion Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Profile Setup"
                  value={`${stats.stepCompletion.profileSetup}%`}
                  icon={Users}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_profileSetup')}
                />
                <StatCard
                  title="Assets Added"
                  value={`${stats.stepCompletion.assetsAdded}%`}
                  icon={Building2}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_assetsAdded')}
                />
                <StatCard
                  title="Beneficiaries Chosen"
                  value={`${stats.stepCompletion.beneficiariesChosen}%`}
                  icon={Users}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_beneficiariesChosen')}
                />
                <StatCard
                  title="Last Wishes"
                  value={`${stats.stepCompletion.lastWishes}%`}
                  icon={FileText}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_lastWishes')}
                />
                <StatCard
                  title="Executor Chosen"
                  value={`${stats.stepCompletion.executorChosen}%`}
                  icon={Users}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_executorChosen')}
                />
                <StatCard
                  title="Will Reviewed"
                  value={`${stats.stepCompletion.willReviewed}%`}
                  icon={FileText}
                  loading={loading}
                  onClick={() => setSelectedMetric('step_willReviewed')}
                />
               <StatCard
                 title="Download & Sign"
                 value={`${stats.stepCompletion.willDownloaded}%`}
                 icon={FileText}
                 loading={loading}
                 onClick={() => setSelectedMetric('step_willDownloaded')}
               />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  loading: boolean;
  onClick?: () => void;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  loading,
  onClick 
}: StatCardProps) {
  return (
    <div 
      className="p-6 rounded-xl cursor-pointer transition-transform hover:scale-[1.02]" 
      onClick={onClick}
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg" style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
        }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-[#2D2D2D]/60">{title}</p>
          <p className="text-2xl font-bold text-[#2D2D2D]">
            {loading ? '-' : value}
          </p>
        </div>
      </div>
    </div>
  );
}