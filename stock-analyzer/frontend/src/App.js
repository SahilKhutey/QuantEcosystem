import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Components (Placeholders)
import Dashboard from './components/Dashboard';
import MarketOverview from './components/MarketOverview';
import NewsFeed from './components/NewsFeed';
import PortfolioTracker from './components/PortfolioTracker';
import AIAnalyst from './components/AIAnalyst';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<MarketOverview />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/portfolio" element={<PortfolioTracker />} />
            <Route path="/analyst" element={<AIAnalyst />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
