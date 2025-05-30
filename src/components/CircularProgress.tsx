import React from 'react';
import './CircularProgress.css';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ 
  value, 
  size = 160, 
  strokeWidth = 12 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [displayValue, setDisplayValue] = React.useState(0);
  const progress = ((100 - displayValue) / 100) * circumference;

  React.useEffect(() => {
    // Animate the value change
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="progress-container">
      <svg
        className="progress-circle"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="progress-background"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-indicator"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0047AB" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>
      <div className="progress-value">
        <span className="progress-percentage">{displayValue}%</span>
        <span className="progress-label">Estate Score</span>
      </div>
    </div>
  );
}