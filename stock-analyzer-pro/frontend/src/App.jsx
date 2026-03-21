import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import NewsFeed from './components/NewsFeed';
import Portfolio from './components/Portfolio';
import Navigation from './components/Navigation';
import { StockProvider } from './context/StockContext';
import './App.css';

function App() {
  return (
    <StockProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stock/:symbol" element={<StockDetail />} />
              <Route path="/news" element={<NewsFeed />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </main>
        </div>
      </Router>
    </StockProvider>
  );
}

export default App;
