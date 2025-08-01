import React from 'react';
import { useAnimateOnMount } from '../../hooks/useAnimateOnMount';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text = 'Loading...' }) => {
  const ref = useAnimateOnMount('fadeIn');

  return (
    <div ref={ref} className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__icon">
        <div className="loading-spinner__dot"></div>
        <div className="loading-spinner__dot"></div>
        <div className="loading-spinner__dot"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
