import React from 'react';
import { Percent, Loader2, Eye, EyeOff } from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { FamilyMember } from '../../lib/types';

const BRAND_COLORS = [
  '#0047AB', // Royal Blue
  '#D4AF37', // Metallic Gold
  '#2D2D2D', // Rich Charcoal
  '#4169E1', // Lighter Blue
  '#FFD700', // Brighter Gold
  '#4682B4', // Steel Blue
  '#DAA520', // Golden Rod
];

interface ResidueAllocationCardProps {
  beneficiaries: Array<FamilyMember | any>;
  allocations: Record<string, number>;
  editMode: boolean;
  onAllocationChange: (beneficiaryId: string, percentage: number) => void;
  onSave: () => void;
  loading?: boolean;
  hasUnsavedChanges?: boolean;
}

const ResiduePieChart: React.FC<{
  allocations: Record<string, number>;
  beneficiaries: Array<FamilyMember | any>;
  showChart: boolean;
}> = ({ allocations, beneficiaries, showChart }) => {
  // Create a stable color mapping for beneficiaries
  const colorMap = React.useMemo(() => {
    return Object.keys(allocations).reduce((acc, id, index) => {
      acc[id] = BRAND_COLORS[index % BRAND_COLORS.length];
      return acc;
    }, {} as Record<string, string>);
  }, [allocations]);

  const data = React.useMemo(() => {
    return Object.entries(allocations).map(([id, value]) => {
      const beneficiary = beneficiaries.find(b => 
        b.type === 'spouse' || b.type === 'partner' 
          ? b.type === id 
          : b.id === id
      );
      return {
        id: beneficiary ? `${beneficiary.first_names} ${beneficiary.last_name}` : 'Unknown',
        value: value || 0,
        color: colorMap[id]
      };
    });
  }, [allocations, beneficiaries]);

  const chartContainerStyle = {
    height: showChart ? '200px' : '0px',
    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    borderRadius: '1rem',
    padding: showChart ? '1rem' : '0',
    margin: showChart ? '1rem 0' : '0',
    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff',
    transition: 'all 0.3s ease',
    opacity: showChart ? 1 : 0,
    overflow: 'hidden'
  };

  return (
    <div style={chartContainerStyle}>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={10}
        colors={({ data }) => data.color}
        borderWidth={1}
        borderColor="#ffffff"
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
        motionConfig={{
          mass: 1,
          tension: 170,
          friction: 26,
          clamp: false,
          precision: 0.01,
          velocity: 0
        }}
        tooltip={({ datum }) => (
          <div
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              padding: '9px 12px',
              borderRadius: '0.75rem',
              boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
            }}
          >
            <strong>{datum.id}</strong>: {datum.value}%
          </div>
        )}
      />
    </div>
  );
};

export function ResidueAllocationCard({
  beneficiaries,
  allocations,
  editMode,
  onAllocationChange,
  onSave,
  loading,
  hasUnsavedChanges
}: ResidueAllocationCardProps) {
  const [showChart, setShowChart] = React.useState(() => {
    const stored = localStorage.getItem('residue-chart-visibility');
    return stored === null ? true : stored === 'true';
  });
  const [totalAllocation, setTotalAllocation] = React.useState(0);

  const handleToggleChart = () => {
    const newValue = !showChart;
    setShowChart(newValue);
    localStorage.setItem('residue-chart-visibility', String(newValue));
  };

  React.useEffect(() => {
    // Calculate total allocation whenever allocations change
    const total = Object.values(allocations).reduce((sum, value) => sum + (value || 0), 0);
    setTotalAllocation(total);
  }, [allocations]);

  return (
    <div className="asset-card -mt-6">
      <div className="asset-header">
        <div className="asset-icon">
          <Percent className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Residue Allocation</h3>
          <p className="text-xs text-[#2D2D2D]/60">
            Allocate the remaining portion of your estate
          </p>
        </div>
        <button
          onClick={handleToggleChart}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showChart ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="asset-content space-y-4">
        <ResiduePieChart
          allocations={allocations}
          beneficiaries={beneficiaries}
          showChart={showChart}
        />

        {beneficiaries.map((beneficiary) => (
          <div key={beneficiary.id} className="allocation-row">
            <div className="beneficiary-info">
              <p className="beneficiary-name text-xs">
                {beneficiary.first_names} {beneficiary.last_name}
              </p>
              <p className="beneficiary-type text-[0.7rem]">
                {beneficiary.relationship || beneficiary.type}
              </p>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              disabled={loading || !editMode}
              value={allocations[
                beneficiary.type === 'spouse' || beneficiary.type === 'partner' 
                  ? beneficiary.type 
                  : beneficiary.id
              ] ?? ''}
              placeholder="0"
              onChange={(e) => onAllocationChange(
                beneficiary.id,
                Math.min(100, Math.max(0, Number(e.target.value) || 0))
              )}
              className="allocation-input"
              style={{
                opacity: (!editMode || loading) ? 0.7 : 1,
                cursor: (!editMode || loading) ? 'not-allowed' : 'auto'
              }}
              step="1"
            />
            <div className="percentage-symbol">%</div>
          </div>
        ))}
        <div className="text-xs text-[#2D2D2D]/60 text-right">
          Remaining allocation: {Math.max(0, 100 - totalAllocation)}%
        </div>
      </div>
      <button
        onClick={onSave}
        className="save-allocations-button"
        disabled={loading || !hasUnsavedChanges || !editMode}
        style={{
          opacity: (loading || !hasUnsavedChanges || !editMode) ? 0.5 : 1,
          cursor: (loading || !hasUnsavedChanges || !editMode) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          'Save Allocations'
        )}
      </button>
    </div>
  );
}