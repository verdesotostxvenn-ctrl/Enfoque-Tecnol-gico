import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';
import MisionVolcan from './components/MisionVolcan';
import MisionInundacion from './components/MisionInundacion';
import MisionEvacuacion from './components/MisionEvacuacion';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import MapasPage from './components/MapasPage';
import MapasAdminPage from './components/MapasAdminPage';
import VideosPage from './components/VideosPage';

function App() {
  return (
    <Router>
      <CustomCursor />
      <Routes>
        {/* Registro inicial */}
        <Route path="/" element={<Lobby />} />

        {/* Panel principal */}
        <Route path="/hub" element={<Hub />} />

        {/* Direcciones de las misiones individuales */}
        <Route path="/volcan" element={<MisionVolcan />} />
        <Route path="/inundacion" element={<MisionInundacion />} />
        <Route path="/evacuacion" element={<MisionEvacuacion />} />

        {/* Caja de herramientas */}
        <Route path="/mapas" element={<MapasPage />} />
        <Route path="/videos" element={<VideosPage />} />

        {/* Panel administrativo */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/mapas" element={<MapasAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
