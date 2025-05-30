import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, Upload, AlertCircle, FileSignature, CheckSquare } from 'lucide-react';
import { toast } from 'sonner'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import * as Tooltip from '@radix-ui/react-tooltip';
import 'swiper/css';
import 'swiper/css/pagination';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalComplianceModal({ isOpen, onClose }: LegalComplianceModalProps) {
  const [isVisible, setIsVisible] = React.useState(isOpen);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [allStepsViewed, setAllStepsViewed] = React.useState(false);
  const totalSteps = 6;
  const [viewedSteps, setViewedSteps] = React.useState<Set<number>>(new Set());
  const [hasCompleted, setHasCompleted] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  
  const steps = [
    {
      emoji: "🖨️",
      title: "1. Print the Document",
      description: "Print all pages of your will on standard paper."
    },
    {
      emoji: "✏️",
      title: "2. Initial Each Page",
      description: "Add your initials at the bottom of every page (except the signature page)."
    },
    {
      emoji: "✍️",
      title: "3. Sign the Last Page",
      description: "Sign your full name on the signature line in the presence of witnesses."
    },
    {
      emoji: "👥",
      title: "4. Have Witnesses Sign",
      description: "Two witnesses must sign in your presence and in each other's presence. They should not be beneficiaries."
    },
    {
      emoji: "🔒",
      title: "5. Store Securely",
      description: "Keep your signed will in a safe place and inform your executor of its location."
    },
    {
      emoji: "📤",
      title: "6. Digital Backup",
      description: "Scan and upload your signed will to Willup for secure digital storage."
    }
  ];

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  React.useEffect(() => {
    // Check if all steps have been viewed
    if (viewedSteps.size >= totalSteps) {
      setAllStepsViewed(true);
    }
  }, [viewedSteps]);

  const handleConfirmCompliance = () => {
    setHasCompleted(true);
    toast.success("Thank you for confirming your will has been properly signed and witnessed!");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSlideChange = (index: number) => {
    setCurrentStep(index);
    setViewedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const handleAnimationComplete = () => {
    if (!isOpen) setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl my-4 mx-4"
        onClick={(e) => e.stopPropagation()}
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
            >
              <FileSignature 
                className="w-5 h-5" 
                style={{
                  background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
              <h2 
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Make Your Will Legal
              </h2>
            </div>
          </div>

          <div className="space-y-2 text-[#2D2D2D] text-sm">
            <p className="font-medium text-sm text-center">
              {localStorage.getItem('legal-compliance-confirmed') === 'true' 
                ? "Have you completed these steps to make your will legally binding?" 
                : "Your will has been downloaded, but to make it legally binding, you must follow these steps:"}
            </p>
            
            <div className="rounded-lg overflow-hidden" style={{
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
            }}>
              {isClient && (
                <Swiper
                  modules={[Pagination, A11y]}
                  spaceBetween={0}
                  slidesPerView={1}
                  pagination={{ 
                    clickable: true,
                    renderBullet: (index, className) => {
                      return `<span class="${className} ${viewedSteps.has(index) ? 'viewed' : ''}" style="width: 8px; height: 8px;"></span>`;
                    }
                  }}
                  onSlideChange={(swiper) => {
                    handleSlideChange(swiper.activeIndex);
                    if (swiper.activeIndex === steps.length - 1) {
                      const allSteps = new Set([...Array(totalSteps).keys()]);
                      setViewedSteps(allSteps);
                    }
                  }}
                  className="h-[180px]"
                >
                  {steps.map((step, index) => (
                    <SwiperSlide key={index}>
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="flex-shrink-0 text-4xl mb-3">{step.emoji}</div>
                        <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                        <p className="text-xs text-[#2D2D2D]/70">{step.description}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border-l-4 border-amber-500 mt-3">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800">
                <p className="font-semibold">Important Legal Note:</p>
                <p>Your will must be signed with two witnesses present simultaneously. Witnesses must be 18+ and not beneficiaries.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-3">
            {localStorage.getItem('legal-compliance-confirmed') === 'true' ? (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-white rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #10B981, #059669)',
                  boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                }}
              >
                <CheckSquare className="w-4 h-4" />
                Already Completed
              </button>
            ) : (
              <>
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={allStepsViewed ? handleConfirmCompliance : undefined}
                        className="w-full py-2.5 px-4 text-white rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
                          opacity: allStepsViewed ? 1 : 0.6,
                          cursor: allStepsViewed ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <CheckSquare className="w-4 h-4" />
                        I've Completed These Steps
                      </button>
                    </Tooltip.Trigger>
                    {!allStepsViewed && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-[#2D2D2D] text-white text-xs px-2 py-1 rounded"
                          sideOffset={5}
                        >
                          Please read through all steps before proceeding
                          <Tooltip.Arrow className="fill-[#2D2D2D]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                </Tooltip.Provider>
                
                <button
                  onClick={allStepsViewed ? onClose : undefined}
                  className="w-full py-2.5 px-4 text-[#2D2D2D]/70 rounded-lg transition-all text-xs"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
                    opacity: allStepsViewed ? 1 : 0.6,
                    cursor: allStepsViewed ? 'pointer' : 'not-allowed'
                  }}
                >
                  Remind Me Later
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}