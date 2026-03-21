import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => (
  <nav className="bg-gray-800 p-4">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Stock Analyzer Pro</Link>
      <div className="space-x-4">
        <Link to="/" className="hover:text-emerald-400">Dashboard</Link>
        <Link to="/news" className="hover:text-emerald-400">News</Link>
        <Link to="/portfolio" className="hover:text-emerald-400">Portfolio</Link>
      </div>
    </div>
  </nav>
);

export default Navigation;
