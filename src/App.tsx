import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Hub from './pages/Hub';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
