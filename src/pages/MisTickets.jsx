import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function MisTickets() {
  const { user } = useAuth();
  const areaUsuario = user?.email?.split('@')[0]?.toUpperCase() || "ÁREA";
  
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [necesitaIndice, setNecesitaIndice] = useState(false);

  useEffect(() => {
    if (!areaUsuario) return;

    const q = query(
      collection(db, "tickets"), 
      where("area", "==", areaUsuario),
      orderBy("fecha", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTickets(ticketsData);
        setCargando(false);
        setNecesitaIndice(false);
      }, 
      (error) => {
        console.error("Error de Firestore:", error);
        if (error.message.includes("index") || error.message.includes("Índice")) {
          setNecesitaIndice(true);
        }
        setCargando(false); 
      }
    );

    return () => unsubscribe();
  }, [areaUsuario]);

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En Progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Tickets del Area</h2>
        
        <div className="bg-amarillo-pastel border border-amarillo-vivo/30 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
          <span className="text-lg">ℹ️</span>
          <p>Solo se muestran los últimos 5 tickets del área. Si necesita más, solicitar a informática.</p>
        </div>
      </div>

      {necesitaIndice && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
          <p className="font-bold text-lg mb-1">⚠️ Acción requerida en Firebase</p>
          <p className="text-sm">
            Para buscar por "Área" y ordenar por "Fecha" al mismo tiempo, Firebase requiere un Índice. 
            Abre la consola de tu navegador (F12), busca el error rojo y haz clic en el enlace que te da Firebase para crearlo automáticamente.
          </p>
        </div>
      )}

      {cargando ? (
        <div className="p-10 text-center text-sm text-gray-400">Cargando tickets...</div>
      ) : tickets.length === 0 && !necesitaIndice ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Aún no has enviado ningún ticket.</p>
        </div>
      ) : (
        /* MATRIZ DE TICKETS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Destinatario: {ticket.dirigidoA}</span>
                  <h3 className="font-bold text-gray-800">
                  <span className="text-amarillo-vivo mr-2">#{ticket.codigo || ticket.id.slice(0,5).toUpperCase()}</span>
                   {ticket.asunto}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-grow">
                <div className="flex gap-2 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${ticket.caracter === 'Urgente' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    {ticket.caracter}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.descripcion}</p>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                <span className="text-[10px] text-gray-400 font-medium">
                  {ticket.fecha ? ticket.fecha.toDate().toLocaleString() : 'Enviando...'}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getColorEstado(ticket.estado)}`}>
                  {ticket.estado}
                </span>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}