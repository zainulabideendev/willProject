import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, MousePointer, Eye, BarChart as BarChartIcon } from 'lucide-react';

type Partner = {
  id: string;
  name: string;
  logo_url?: string;
};

type PartnerMetricsData = {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  click_through_rate: number;
  conversion_rate: number;
  daily_metrics: Array<{
    date: string;
    views: number;
    clicks: number;
    conversions: number;
  }>;
};

interface PartnerMetricsProps {
  data: PartnerMetricsData;
  partner?: Partner;
}

export function PartnerMetrics({ data, partner }: PartnerMetricsProps) {
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('30d');
  
  // Format daily metrics data for charts
  const chartData = React.useMemo(() => {
    if (!data || !data.daily_metrics) return [];
    
    // Filter based on selected time range
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    return data.daily_metrics
      .slice(0, daysToShow)
      .map(day => ({
        ...day,
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .reverse();
  }, [data?.daily_metrics, timeRange]);

  // Calculate percentage changes
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get previous period metrics for comparison
  const getPreviousPeriodMetrics = () => {
    if (!data || !data.daily_metrics || data.daily_metrics.length === 0) {
      return { views: 0, clicks: 0, conversions: 0 };
    }
    
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Current period
    const currentPeriod = data.daily_metrics.slice(0, daysToShow);
    const currentViews = currentPeriod.reduce((sum, day) => sum + (day?.views ?? 0), 0);
    const currentClicks = currentPeriod.reduce((sum, day) => sum + (day?.clicks ?? 0), 0);
    const currentConversions = currentPeriod.reduce((sum, day) => sum + (day?.conversions ?? 0), 0);
    
    // Previous period (same length)
    const previousPeriod = data.daily_metrics.slice(daysToShow, daysToShow * 2);
    const previousViews = previousPeriod.reduce((sum, day) => sum + (day?.views ?? 0), 0);
    const previousClicks = previousPeriod.reduce((sum, day) => sum + (day?.clicks ?? 0), 0);
    const previousConversions = previousPeriod.reduce((sum, day) => sum + (day?.conversions ?? 0), 0);
    
    return {
      views: getPercentChange(currentViews, previousViews),
      clicks: getPercentChange(currentClicks, previousClicks),
      conversions: getPercentChange(currentConversions, previousConversions)
    };
  };

  const changes = getPreviousPeriodMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {partner ? `${partner.name} Metrics` : 'Partner Metrics'}
        </h3>
        <div className="flex rounded-lg overflow-hidden" style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
        }}>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm ${timeRange === '7d' 
              ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white' 
              : 'text-[#2D2D2D]'}`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-sm ${timeRange === '30d' 
              ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white' 
              : 'text-[#2D2D2D]'}`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 text-sm ${timeRange === '90d' 
              ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white' 
              : 'text-[#2D2D2D]'}`}
          >
            90D
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
              }}>
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#2D2D2D]/60">Views</span>
            </div>
            <div className={`flex items-center text-xs ${changes.views >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changes.views >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(Math.round(changes.views))}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{data && typeof data.total_views === 'number' ? data.total_views.toLocaleString() : '0'}</div>
        </div>

        <div className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
              }}>
                <MousePointer className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#2D2D2D]/60">Clicks</span>
            </div>
            <div className={`flex items-center text-xs ${changes.clicks >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changes.clicks >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(Math.round(changes.clicks))}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{data && typeof data.total_clicks === 'number' ? data.total_clicks.toLocaleString() : '0'}</div>
          <div className="text-xs text-[#2D2D2D]/60 mt-1">
            CTR: {data && typeof data.click_through_rate === 'number' ? data.click_through_rate.toFixed(2) : '0.00'}%
          </div>
        </div>

        <div className="p-6 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)'
              }}>
                <BarChartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#2D2D2D]/60">Conversions</span>
            </div>
            <div className={`flex items-center text-xs ${changes.conversions >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changes.conversions >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(Math.round(changes.conversions))}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{data && typeof data.total_conversions === 'number' ? data.total_conversions.toLocaleString() : '0'}</div>
          <div className="text-xs text-[#2D2D2D]/60 mt-1">
            Conv. Rate: {data && typeof data.conversion_rate === 'number' ? data.conversion_rate.toFixed(2) : '0.00'}%
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
        }}
      >
        <h4 className="text-base font-semibold mb-4">Performance Trends</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#0047AB" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#D4AF37" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#2D2D2D" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
        }}
      >
        <h4 className="text-base font-semibold mb-4">Conversion Funnel</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { 
                  name: 'Funnel', 
                  Views: data && typeof data.total_views === 'number' ? data.total_views : 0, 
                  Clicks: data && typeof data.total_clicks === 'number' ? data.total_clicks : 0, 
                  Conversions: data && typeof data.total_conversions === 'number' ? data.total_conversions : 0 
                }
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="Views" fill="#0047AB" />
              <Bar dataKey="Clicks" fill="#D4AF37" />
              <Bar dataKey="Conversions" fill="#2D2D2D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}