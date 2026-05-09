import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';

function App() {
  return (
    <Router>
      <Routes>
        {/* Registro inicial */}
        <Route path="/" element={<Lobby />} />
        {/* Panel de misiones */}
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
