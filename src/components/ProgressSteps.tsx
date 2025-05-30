import React from 'react';
import { Check } from 'lucide-react';
import './ProgressSteps.css';

interface Step {
  label: string;
  completed: boolean;
  score: number;
  description: string;
}

interface ProgressStepsProps {
  steps: Step[];
  onNextStep?: (step: string) => void;
  onStepClick?: (index: number, step: Step) => void;
  downloadWill: () => void;
  downloadWill: () => void;
}

export function ProgressSteps({ steps, onNextStep, onStepClick, downloadWill }: ProgressStepsProps) {
  // Find the first incomplete step
  const currentStepIndex = steps.findIndex(step => !step.completed);
  const currentStep = steps[currentStepIndex] || null;
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = completedSteps === steps.length ? 100 : (completedSteps / (steps.length - 1)) * 100;
  const stepNumber = currentStepIndex === -1 ? steps.length : currentStepIndex + 1;

  // Determine if a step is clickable (completed or current)
  const isStepClickable = (index: number) => {
    return index <= currentStepIndex || steps[index].completed;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm font-medium text-[#2D2D2D]/60">
          Step {stepNumber} of {steps.length}
        </p>
      </div>
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="progress-bar-container" />
        
        {/* Progress bar fill */}
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex flex-col items-center">
            <div
              onClick={() => isStepClickable(index) ? onStepClick?.(index, step) : null}
              className={`step-indicator ${
                step.completed ? 'step-indicator-completed' : 'step-indicator-incomplete'
              } ${!isStepClickable(index) ? 'step-indicator-disabled' : ''}`}
            >
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm text-gray-500">{index + 1}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {currentStep && onNextStep && (
        <button
          onClick={() => {
            currentStep.label === 'Download & Sign' ? downloadWill() : 
            onNextStep(currentStep.label)
          }}
          className="next-step-button" 
          disabled={currentStep.label === 'Review Will' && !steps.slice(0, 5).every(step => step.completed)}
        >
          {currentStep.label}
        </button>
      )}
    </div>
  );
}