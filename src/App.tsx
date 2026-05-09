import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';
// Importamos las nuevas misiones
import MisionVolcan from './components/MisionVolcan';
import MisionInundacion from './components/MisionInundacion';
import MisionEvacuacion from './components/MisionEvacuacion';

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
      </Routes>
    </Router>
  );
}

export default App;
