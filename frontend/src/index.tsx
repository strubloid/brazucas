import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './App';

// Font Awesome configuration
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faNewspaper, faUsers, faBriefcase, faEnvelope, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faFacebookF, faWhatsapp, faNewspaper, faUsers, faBriefcase, faEnvelope, faMapMarkerAlt, faClock);

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
