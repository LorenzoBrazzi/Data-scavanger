
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ApiKeyManagement from './components/ApiKeyManagement';
import Settings from './pages/Settings';
import SecurityRecommendations from './pages/SecurityRecommendations';
import './App.css';
import ApiKeyTest from './components/ApiKeyTest';

function App() {
  return (
    <Router>
      {/* Removed Toaster component */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/api-keys" element={<ApiKeyManagement />} />
        <Route path="/api-test" element={<ApiKeyTest />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/security-recommendations" element={<SecurityRecommendations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
