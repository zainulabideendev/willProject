import React from 'react';
import { Loader2, HelpCircle, Wallet } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface DebtStatusProps {
  assetId: string;
  assetType: 'vehicle' | 'property';
  isFullyPaid?: boolean;
  debtHandlingMethod?: string;
}

const debtHandlingOptions = [
  {
    id: 'subject_to_existing_debt',
    label: 'Subject-to-Existing Debt',
    description: 'The beneficiary receives the asset "as-is" with the outstanding loan remaining attached. This means the beneficiary assumes responsibility for the existing debt (subject to lender approval) when taking ownership of the asset.'
  },
  {
    id: 'estate_paid_debt',
    label: 'Estate-Paid Debt',
    description: 'The estate is instructed to pay off the outstanding debt from its available funds before distributing the asset. The beneficiary then receives the asset free of any encumbrances, with the debt being settled as part of the estate\'s obligations.'
  },
  {
    id: 'asset_sale_and_distribution',
    label: 'Asset Sale and Net Distribution',
    description: 'The executor is directed to sell the asset. The proceeds are then used to pay off the outstanding debt, and any remaining net value is distributed to the designated beneficiary (or beneficiaries).'
  },
  {
    id: 'partial_allocation_with_deduction',
    label: 'Partial Allocation with Debt Deduction',
    description: 'The beneficiary is allocated a percentage of the asset\'s equity after subtracting the outstanding debt. For example, if the asset\'s market value is significantly higher than the loan, the beneficiary receives the net residual value once the debt is cleared.'
  },
  {
    id: 'hybrid_approach',
    label: 'Hybrid Approach',
    description: 'A combination of the above options: for instance, the executor may be instructed to negotiate a restructuring of the debt. Part of the debt might be paid off by the estate and the remaining balance assumed by the beneficiary, depending on the asset\'s value and the beneficiary\'s capacity.'
  }
];

export function DebtStatus({ assetId, assetType, isFullyPaid: initialIsFullyPaid, debtHandlingMethod: initialMethod }: DebtStatusProps) {
  const [isFullyPaid, setIsFullyPaid] = React.useState(initialIsFullyPaid);
  const [debtHandlingMethod, setDebtHandlingMethod] = React.useState(initialMethod);
  const [saving, setSaving] = React.useState(false);

  const handleDebtStatusChange = async (paid: boolean) => {
    setIsFullyPaid(paid);
    if (paid) {
      setDebtHandlingMethod(undefined);
    }
    // Save to localStorage
    localStorage.setItem(`debt-status-${assetId}`, JSON.stringify({ isFullyPaid: paid, debtHandlingMethod: paid ? null : debtHandlingMethod }));
  };

  const handleMethodChange = async (method: string) => {
    setDebtHandlingMethod(method);
    // Save to localStorage
    localStorage.setItem(`debt-status-${assetId}`, JSON.stringify({ isFullyPaid, debtHandlingMethod: method }));
  };

  const handleSaveDebtStatus = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('assets')
        .update({ 
          is_fully_paid: isFullyPaid,
          debt_handling_method: isFullyPaid ? null : debtHandlingMethod 
        })
        .eq('id', assetId);

      if (error) throw error;
      
      toast.success('Debt status saved successfully');
    } catch (error) {
      console.error('Error saving debt status:', error);
      toast.error('Failed to save debt status');
    } finally {
      setSaving(false);
    }
  };

  // Load saved state from localStorage on mount
  React.useEffect(() => {
    const savedStatus = localStorage.getItem(`debt-status-${assetId}`);
    if (savedStatus) {
      const { isFullyPaid: savedPaid, debtHandlingMethod: savedMethod } = JSON.parse(savedStatus);
      setIsFullyPaid(savedPaid);
      setDebtHandlingMethod(savedMethod);
    }
  }, [assetId]);

  return (
    <div className="mt-4 p-6 rounded-lg" style={{
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          color: 'white'
        }}>
          <Wallet className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-semibold">Debt Status</h3>
      </div>
      <div className="mb-4">
        <p className="text-xs text-[#2D2D2D]/60 mb-3">
          Is this {assetType === 'vehicle' ? 'vehicle' : 'property'} fully paid up?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleDebtStatusChange(true)}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-sm ${
              isFullyPaid 
                ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white'
                : 'bg-gradient-to-r from-[#ffffff] to-[#f5f5f5]'}`}
            style={{
              boxShadow: isFullyPaid 
                ? '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
            }}
          >
            Yes
          </button>
          <button
            onClick={() => handleDebtStatusChange(false)}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-sm ${
              isFullyPaid === false
                ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white'
                : 'bg-gradient-to-r from-[#ffffff] to-[#f5f5f5]'}`}
            style={{
              boxShadow: isFullyPaid === false
                ? '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
            }}
          >
            No
          </button>
        </div>
      </div>

      {isFullyPaid === false && (
        <div>
          <p className="text-xs text-[#2D2D2D]/60 mb-3">
            How would you like the remaining debt to be handled?
          </p>
          <div className="space-y-3">
            {debtHandlingOptions.map((option) => (
              <Tooltip.Provider key={option.id}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => handleMethodChange(option.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        debtHandlingMethod === option.id
                          ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white'
                          : 'bg-gradient-to-r from-[#ffffff] to-[#f5f5f5]'}`}
                      style={{
                        boxShadow: debtHandlingMethod === option.id
                          ? '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                          : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{option.label}</span>
                        <Tooltip.Trigger asChild>
                          <button 
                            className="p-1 rounded-full hover:bg-black/5 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip.Trigger>
                      </div>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="max-w-[calc(100vw-2rem)] sm:max-w-md text-white text-xs px-3 py-2 rounded-lg"
                      side="top"
                      align="center"
                      avoidCollisions={true}
                      style={{
                        background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                      }}
                      sideOffset={5}
                      onPointerDownOutside={(e) => e.preventDefault()}
                    >
                      {option.description}
                      <Tooltip.Arrow className="fill-[#0047AB]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleSaveDebtStatus}
        disabled={saving}
        className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
        style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
          opacity: saving ? 0.5 : 1,
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
        ) : (
          'Save Debt Status'
        )}
      </button>
    </div>
  );
}