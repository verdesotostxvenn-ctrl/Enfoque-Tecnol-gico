import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import HubWithWelcome from './components/HubWithWelcome';
import MisionVolcan from './components/MisionVolcan';
import MisionInundacion from './components/MisionInundacion';
import MisionEvacuacion from './components/MisionEvacuacion';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import MapasPage from './components/MapasPage';
import MapasAdminWithTerritory from './components/MapasAdminWithTerritory';
import TerritorialAdminPage from './components/TerritorialAdminPage';
import VideosPage from './components/VideosPage';

function App() {
  return (
    <Router>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/hub" element={<HubWithWelcome />} />

        <Route path="/volcan" element={<MisionVolcan />} />
        <Route path="/inundacion" element={<MisionInundacion />} />
        <Route path="/evacuacion" element={<MisionEvacuacion />} />

        <Route path="/mapas" element={<MapasPage />} />
        <Route path="/videos" element={<VideosPage />} />

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/mapas" element={<MapasAdminWithTerritory />} />
        <Route path="/admin/territorio" element={<TerritorialAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
