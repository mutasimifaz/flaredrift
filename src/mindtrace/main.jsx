import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';
import './mindtrace.css';
import './mindtrace-responsive-overrides.css';
import MindtraceApp from './MindtraceApp.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MindtraceApp />
  </React.StrictMode>
);
