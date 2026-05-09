import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Lobby />} />
        {/* Ruta del Hub táctico */}
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
