import React from 'react';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface OtherAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OtherAssetsModal({ isOpen, onClose }: OtherAssetsModalProps) {
  const [isVisible, setIsVisible] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  const handleAnimationComplete = () => {
    if (!isOpen) setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        onAnimationComplete={handleAnimationComplete}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 200,
          mass: 0.8
        }}
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: `
            20px 20px 60px #d9d9d9,
            -20px -20px 60px #ffffff,
            inset 2px 2px 4px rgba(255, 255, 255, 0.8),
            inset -2px -2px 4px rgba(70, 70, 70, 0.1)
          `
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div 
              className="flex items-center gap-2"
              style={{
                background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <Info className="w-5 h-5" />
              <h2 className="text-xl font-bold">Important Notice</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-[#2D2D2D]" />
            </button>
          </div>

          <div className="space-y-3 text-[#2D2D2D] text-sm">
            <div className="p-3 rounded-lg" style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
            }}>
              <p className="mb-2">Please note that the following should NOT be added as assets in this "Other" category:</p>
              <ul className="space-y-2 text-[#2D2D2D]/80">
                <li>• Insurance Policies</li>
                <li>• Pension Funds</li>
                <li>• Retirement Annuities</li>
                <li>• Funeral Covers</li>
              </ul>
            </div>

            <p className="text-[#2D2D2D]/60 text-xs">
              These items with named beneficiaries do not form part of your estate. Their proceeds will be paid directly to the designated beneficiaries.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 px-4 text-white rounded-lg transition-all text-sm"
            style={{
              background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
              boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
            }}
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}