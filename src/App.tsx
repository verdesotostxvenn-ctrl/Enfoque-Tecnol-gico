import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';
import MisionVolcan from './components/MisionVolcan';
import MisionInundacion from './components/MisionInundacion';
import MisionEvacuacion from './components/MisionEvacuacion';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        {/* Registro inicial */}
        <Route path="/" element={<Lobby />} />

        {/* Panel principal */}
        <Route path="/hub" element={<Hub />} />

        {/* Direcciones de las misiones individuales */}
        <Route path="/volcan" element={<MisionVolcan />} />
        <Route path="/inundacion" element={<MisionInundacion />} />
        <Route path="/evacuacion" element={<MisionEvacuacion />} />

        {/* Panel administrativo */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
