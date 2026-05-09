import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial en la carpeta components */}
        <Route path="/" element={<Lobby />} />
        {/* Página del Hub en la carpeta components */}
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
