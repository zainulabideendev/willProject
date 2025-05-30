import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import * as Tooltip from '@radix-ui/react-tooltip';
import './WelcomeModal.css';

const steps = [
  {
    title: 'Complete Your Profile',
    description: 'Start by filling in your personal details. This helps us create a will that\'s uniquely yours.',
    icon: '👤'
  },
  {
    title: 'Add Your Assets',
    description: 'List your properties, investments, and valuable possessions to ensure they\'re properly distributed.',
    icon: '💰'
  },
  {
    title: 'Choose Beneficiaries',
    description: 'Select the people or organizations who will inherit your assets.',
    icon: '👥'
  },
  {
    title: 'Document Last Wishes',
    description: 'Share any specific requests or messages for your loved ones.',
    icon: '📝'
  },
  {
    title: 'Select an Executor',
    description: 'Choose someone trustworthy to carry out your will\'s instructions.',
    icon: '⚖️'
  },
  {
    title: 'Review Your Will',
    description: 'Take a final look at your will to ensure everything is exactly as you want it.',
    icon: '👀'
  },
  {
    title: 'Download and Sign',
    description: 'Download your will document, sign it in the presence of witnesses to make it legally binding.',
    icon: '✍️'
  }
];

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = React.useState(isOpen);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [allStepsViewed, setAllStepsViewed] = React.useState(false);
  const totalSteps = steps.length;
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  React.useEffect(() => {
    // Mark all steps as viewed when we reach the last step
    if (currentStep === totalSteps - 1) {
      setAllStepsViewed(true);
    }
  }, [currentStep, totalSteps]);

  const handleAnimationComplete = () => {
    if (!isOpen) setIsVisible(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      style={{ display: isVisible ? 'flex' : 'none' }}
     className="modal-overlay"
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
       className="relative w-full max-w-xl mx-auto overflow-hidden rounded-t-2xl sm:rounded-2xl modal-container"
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-center mb-2">
            <h2 className="text-2xl font-bold text-center modal-title">
            Welcome to Willup
            </h2>
          </div>
          <p className="text-[#2D2D2D]/60 text-center mb-6">
            Let's guide you through creating your will
          </p>

          {isClient && (
            <Swiper
              modules={[Pagination, A11y]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ 
                clickable: true,
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              onSlideChange={(swiper) => setCurrentStep(swiper.activeIndex)}
              className="h-[300px] sm:h-[350px]"
            >
              {steps.map((step, index) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
                    <div 
                     className="text-4xl mb-6 p-4 rounded-full step-icon-container"
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-[#2D2D2D]">
                      {step.title}
                    </h3>
                    <p className="text-[#2D2D2D]/60">
                      {step.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={allStepsViewed ? onClose : undefined}
                  className="w-full mt-4 py-3 px-4 text-white rounded-lg transition-all get-started-button"
                  style={{
                    opacity: allStepsViewed ? 1 : 0.6,
                    cursor: allStepsViewed ? 'pointer' : 'not-allowed'
                  }}
                >
                  Get Started
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
        </div>
      </motion.div>
    </motion.div>
  );
}