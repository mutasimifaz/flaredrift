import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// The page is rendered by React after load, so honour deep links such as /#flare-lab
// when arriving from /ventures/ or /vision/.
if (window.location.hash) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView();
  }, 350);
}
