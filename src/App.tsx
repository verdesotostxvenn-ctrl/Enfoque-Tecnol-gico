import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Hub from './components/Hub';

function App() {
  return (
    <Router>
      <Routes>
        {/* Esta es la pantalla de inicio */}
        <Route path="/" element={<Lobby />} />
        {/* Esta es la pantalla a la que saltará después del registro */}
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
