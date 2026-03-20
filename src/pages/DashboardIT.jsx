import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, writeBatch, limit } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardIT() {
  const [tickets, setTickets] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroArea, setFiltroArea] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  
  
  const [ticketResolviendo, setTicketResolviendo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("fecha", "desc"), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try { await updateDoc(doc(db, "tickets", id), { estado: nuevoEstado }); } 
    catch (error) { console.error("Error al actualizar:", error); }
  };

  const confirmarResolucion = async (id) => {
    try {
      await updateDoc(doc(db, "tickets", id), {
        estado: "Completado",
        resueltoPor: ticketResolviendo.resueltoPor,
        observaciones: ticketResolviendo.observaciones
      });
      setTicketResolviendo(null); 
    } catch (error) {
      console.error("Error al finalizar ticket:", error);
    }
  };

  const eliminarTicket = async (id) => {
    if (window.confirm("¿Eliminar este ticket permanentemente?")) {
      await deleteDoc(doc(db, "tickets", id));
    }
  };

  const eliminarTodosLosTickets = async () => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar TODOS los tickets? Te sugerimos exportar un JSON primero como backup.");
    if (confirmacion) {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        alert("Base de datos limpia.");
      } catch (error) {
        console.error("Error al limpiar la base de datos:", error);
      }
    }
  };

const exportarJSON = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));
      
      
      const todosLosTickets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha ? data.fecha.toDate().toLocaleString() : "Sin fecha" 
        };
      });
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todosLosTickets, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Backup_Tickets_ASOEM_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Error al generar JSON:", error);
      alert("Hubo un error al generar el archivo de respaldo.");
    }
  };

  const generarPDF = (soloFiltrados = false) => {
    try {
      const docPDF = new jsPDF();
      const dataParaPdf = soloFiltrados ? ticketsFiltrados : tickets;
      const titulo = soloFiltrados && filtroArea !== "Todas" 
        ? `Reporte de Tickets - Área: ${filtroArea}` 
        : "Reporte General de Tickets IT";

      docPDF.setFontSize(14);
      docPDF.text(titulo, 14, 15);
      docPDF.setFontSize(10);
      docPDF.setTextColor(100);
      docPDF.text(`Generado el: ${new Date().toLocaleString()}`, 14, 22);

      const tableRows = dataParaPdf.map(t => [
        t.codigo || t.id.slice(0,5).toUpperCase(),
        t.fecha?.toDate().toLocaleDateString() || "N/A",
        t.area,
        t.asunto,
        t.descripcion || "Sin descripción",
        t.dirigidoA,
        t.caracter,
        t.estado
      ]);

      autoTable(docPDF, {
        head: [['ID', 'Fecha', 'Área', 'Asunto', 'Descripción', 'Destino', 'Prioridad', 'Estado']],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [246, 224, 94], textColor: [0, 0, 0] },
        styles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 50 } }
      });

      docPDF.save(`${titulo.replace(/ /g, "_")}.pdf`);
    } catch (error) {
      console.error("Error PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  const areasDisponibles = ["Todas", ...new Set(tickets.map(t => t.area))];
  const ticketsFiltrados = tickets.filter(t => 
    (filtroEstado === "Todos" || t.estado === filtroEstado) &&
    (filtroArea === "Todas" || t.area === filtroArea)
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Panel de Administración IT</h2>
          <p className="text-gray-500 text-sm">Gestión central de soporte</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          
          <button onClick={exportarJSON} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-all shadow-sm">
            Exportar JSON
          </button>
          <button onClick={() => generarPDF(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
            PDF General
          </button>
          <button onClick={() => generarPDF(true)} className="px-4 py-2 bg-amarillo-vivo text-gray-900 rounded-lg text-sm font-medium hover:bg-amarillo-hover transition-all shadow-sm">
            PDF Filtrado
          </button>
          <button onClick={eliminarTodosLosTickets} className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-all">
            Vaciar Todo
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Área</label>
          <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amarillo-vivo text-sm">
            {areasDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex-[2] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Estado</label>
          <div className="flex gap-2 flex-wrap">
            {["Todos", "Pendiente", "En Progreso", "Completado"].map(e => (
              <button 
                key={e} 
                onClick={() => setFiltroEstado(e)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filtroEstado === e ? "bg-white border-gray-400 text-gray-900 shadow-sm" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MATRIZ DE TICKETS */}
      {cargando ? (
        <div className="p-10 text-center text-sm text-gray-400">Cargando base de datos...</div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-100">No hay tickets que coincidan con los filtros.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketsFiltrados.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {t.area} • <span className="text-gray-600">#{t.codigo || t.id.slice(0,5).toUpperCase()}</span>
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{t.asunto}</p>
                </div>
                <button onClick={() => eliminarTicket(t.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

              <div className="p-4 flex-grow">
                <div className="flex gap-2 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${t.caracter === 'Urgente' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{t.caracter}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">Asignado a: {t.dirigidoA}</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">{t.descripcion}</p>
                
                {t.estado === "Completado" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-800 font-medium">
                      <span className="font-bold">Resuelto por:</span> {t.resueltoPor || "No especificado"}
                    </p>
                    {t.observaciones && (
                      <p className="text-xs text-green-700 mt-1 italic">"{t.observaciones}"</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <span>{t.fecha?.toDate().toLocaleString()}</span>
                  <span className={`px-2 py-1 rounded-md uppercase font-bold ${
                    t.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    t.estado === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>{t.estado}</span>
                </div>

               
                <div className="mt-2">
                  {t.estado === "Pendiente" && (
                    <button onClick={() => cambiarEstado(t.id, "En Progreso")} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors">EMPEZAR</button>
                  )}
                  
                  {t.estado === "En Progreso" && (!ticketResolviendo || ticketResolviendo.id !== t.id) && (
                    <button 
                      onClick={() => setTicketResolviendo({ id: t.id, resueltoPor: "", observaciones: "" })} 
                      className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      FINALIZAR TICKET
                    </button>
                  )}

                  {t.estado === "En Progreso" && ticketResolviendo?.id === t.id && (
                    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <select 
                        value={ticketResolviendo.resueltoPor}
                        onChange={(e) => setTicketResolviendo({...ticketResolviendo, resueltoPor: e.target.value})}
                        className="p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="" disabled>Resuelto por...</option>
                        <option value="Ruben">Ruben</option>
                        <option value="Diego">Diego</option>
                        <option value="Mariano">Mariano</option>
                        <option value="Emilio">Emilio</option>
                      </select>
                      
                      <textarea 
                        placeholder="Observaciones de la resolución..."
                        value={ticketResolviendo.observaciones}
                        onChange={(e) => setTicketResolviendo({...ticketResolviendo, observaciones: e.target.value})}
                        className="p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-green-500 resize-none"
                        rows="2"
                      />
                      
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => setTicketResolviendo(null)} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[10px] font-bold transition-colors">CANCELAR</button>
                        <button 
                          onClick={() => confirmarResolucion(t.id)} 
                          disabled={!ticketResolviendo.resueltoPor}
                          className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                        >CONFIRMAR</button>
                      </div>
                    </div>
                  )}

                  {t.estado === "Completado" && (
                     <button onClick={() => cambiarEstado(t.id, "En Progreso")} className="w-full py-2 bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 rounded-lg text-xs font-bold transition-colors">REABRIR TICKET</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}