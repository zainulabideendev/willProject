import React from 'react';
import './StepProgressBar.css';

interface StepProgressBarProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: number) => void;
}

export function StepProgressBar({ currentStep, steps, onStepClick }: StepProgressBarProps) {
  const progressWidth = `${(currentStep / (steps.length - 1)) * 100}%`;

  return (
    <div className="step-progress-container">
      <div className="step-progress-line" style={{ width: progressWidth }}></div>
      {steps.map((step, index) => (
        <div 
          key={index} 
          className="step-item"
          onClick={() => onStepClick(index)}
        >
          <div 
            className={`step-dot ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : 'inactive'
            }`}
          ></div>
          <div 
            className={`step-label ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : 'inactive'
            }`}
          >
            {step}
          </div>
        </div>
      ))}
    </div>
  );
}