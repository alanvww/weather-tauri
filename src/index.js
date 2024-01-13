import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import './index.css';
import App from './App';

// Create a root.
const root = createRoot(document.getElementById('root'));

// Use the root to render your App.
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// Continue using reportWebVitals as before.
