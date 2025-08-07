import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './App';

// Font Awesome configuration
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faNewspaper, faUsers, faBriefcase, faEnvelope, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

// Development utilities
import { StatusSystemService } from './services/statusSystemService';
import { StatisticsService } from './services/statisticsService';

// Add icons to the library
library.add(faFacebookF, faWhatsapp, faNewspaper, faUsers, faBriefcase, faEnvelope, faMapMarkerAlt, faClock);

// Expose services globally for easy console access in development
if (process.env.NODE_ENV === 'development') {
  (window as any).StatusSystemService = StatusSystemService;
  (window as any).StatisticsService = StatisticsService;
  console.log('Development services available globally:');
  console.log('StatusSystemService.setEnabled(false) - Disable status system');
  console.log('StatusSystemService.setEnabled(true) - Enable status system');
  console.log('StatisticsService.setEnabled(false) - Disable statistics');
  console.log('StatisticsService.setEnabled(true) - Enable statistics');
  console.log('Use .getEnabled() to check current state of any service');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
