import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface MetricDetailsProps {
  metric: string;
  onBack: () => void;
}

export function MetricDetails({ metric, onBack }: MetricDetailsProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let query;

        switch (metric) {
          case 'users':
            query = supabase
              .from('profiles')
              .select('*')
              .order('last_updated', { ascending: false });
            break;
          case 'wills':
            query = supabase
              .from('profiles')
              .select('id, full_name, email, last_updated')
              .eq('will_reviewed', true)
              .order('last_updated', { ascending: false });
            break;
          case 'children':
            query = supabase
              .from('children')
              .select(`
                id, title, first_names, last_name, date_of_birth, email, phone,
                profile:profiles(full_name, email)
              `)
              .order('created_at', { ascending: false });
            break;
          case 'beneficiaries':
            query = supabase
              .from('beneficiaries')
              .select(`
                id, title, first_names, last_name, relationship, phone, is_family_member,
                profile:profiles(full_name, email)
              `)
              .order('created_at', { ascending: false });
            break;
          case 'married':
            query = supabase
              .from('profiles')
              .select('id, full_name, email, spouse_first_name, spouse_last_name, last_updated')
              .eq('marital_status', 'married')
              .order('last_updated', { ascending: false });
            break;
          case 'single':
            query = supabase
              .from('profiles')
              .select('id, full_name, email, last_updated')
              .eq('marital_status', 'single')
              .order('last_updated', { ascending: false });
            break;
          case 'partners':
            query = supabase
              .from('partner_firms')
              .select('*')
              .order('updated_at', { ascending: false });
            break;
          case 'completion':
            query = supabase
              .from('estate_score')
              .select(`
                *,
                profile:profiles(full_name, email)
              `)
              .order('total_score', { ascending: false });
            break;
          case 'step_willReviewed':
            query = supabase
              .from('profiles')
              .select('id, full_name, email, last_updated')
              .eq('will_reviewed', true)
              .order('last_updated', { ascending: false });
            break;
          case 'step_willDownloaded':
            query = supabase
              .from('profiles')
              .select('id, full_name, email, last_updated')
              .eq('will_downloaded', true)
              .order('last_updated', { ascending: false });
            break;
          default:
            if (metric.startsWith('step_')) {
              const step = metric.replace('step_', '');
              const columnMap: Record<string, string> = {
                profileSetup: 'profile_setup_complete',
                assetsAdded: 'assets_added',
                beneficiariesChosen: 'beneficiaries_chosen',
                lastWishes: 'last_wishes_documented',
                executorChosen: 'executor_chosen',
                willReviewed: 'will_reviewed'
              };
              
              query = supabase
                .from('profiles')
                .select('id, full_name, email, last_updated')
                .eq(columnMap[step], true)
                .order('last_updated', { ascending: false });
            }
            break;
        }

        if (query) {
          const { data: queryData, error } = await query;
          if (error) throw error;
          setData(queryData || []);
        }
      } catch (error) {
        console.error('Error fetching metric details:', error);
        toast.error('Failed to load metric details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metric]);

  const getTitle = () => {
    switch (metric) {
      case 'users':
        return 'All Users';
      case 'wills':
        return 'Completed Wills';
      case 'children':
        return 'All Children';
      case 'beneficiaries':
        return 'All Beneficiaries';
      case 'married':
        return 'Married Users';
      case 'single':
        return 'Single Users';
      case 'partners':
        return 'Partner Firms';
      case 'completion':
        return 'Estate Completion Scores';
      case 'step_profileSetup':
        return 'Profile Setup Completion';
      case 'step_assetsAdded':
        return 'Assets Added';
      case 'step_beneficiariesChosen':
        return 'Beneficiaries Chosen';
      case 'step_lastWishes':
        return 'Last Wishes Documented';
      case 'step_executorChosen':
        return 'Executor Chosen';
      case 'step_willReviewed':
        return 'Will Reviewed';
      case 'step_willDownloaded':
        return 'Download & Sign Completion';
      default:
        return 'Metric Details';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h2 className="text-xl font-semibold text-[#2D2D2D]">{getTitle()}</h2>
      </div>

      <div className="overflow-hidden rounded-lg shadow" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {metric === 'partners' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Experience</th>
                </>
              ) : metric === 'children' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Date of Birth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Contact</th>
                </>
              ) : metric === 'beneficiaries' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Relationship</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Type</th>
                </>
              ) : metric === 'married' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Spouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Last Updated</th>
                </>
              ) : metric === 'completion' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">Last Updated</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2D2D2D]/60 uppercase tracking-wider">
                    Last Updated
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                {metric === 'partners' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.contact_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.registration_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.years_experience} years</td>
                  </>
                ) : metric === 'children' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {item.title} {item.first_names} {item.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.profile?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.email || item.phone || '-'}</td>
                  </>
                ) : metric === 'beneficiaries' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {item.title} {item.first_names} {item.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.profile?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.relationship || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D] capitalize">
                      {item.is_family_member ? 'Family Member' : 'Manual'}
                    </td>
                  </>
                ) : metric === 'married' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {item.spouse_first_name} {item.spouse_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                  </>
                ) : metric === 'completion' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.profile?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.total_score}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">{item.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D] capitalize">{item.marital_status || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D] capitalize">{item.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D2D2D]">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}