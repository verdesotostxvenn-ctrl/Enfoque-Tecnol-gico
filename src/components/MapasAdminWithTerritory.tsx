import { useNavigate } from 'react-router-dom';
import { MapPinned } from 'lucide-react';
import FastMapAdminPage from './FastMapAdminPage';

const MapasAdminWithTerritory = () => {
  const navigate = useNavigate();
  return (
    <>
      <FastMapAdminPage />
      <button
        type="button"
        onClick={() => navigate('/admin/territorio')}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-emerald-300/30 bg-slate-950/95 px-5 py-4 text-xs font-black uppercase tracking-widest text-emerald-200 shadow-2xl backdrop-blur-xl hover:bg-emerald-300 hover:text-slate-950"
      >
        <MapPinned size={18} /> Cantones y parroquias
      </button>
    </>
  );
};

export default MapasAdminWithTerritory;
