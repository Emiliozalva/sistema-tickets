import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import { db } from "../config/firebase"; 
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function IntraTickets() {
  const { user } = useAuth();
  
  const nombreRemitente = localStorage.getItem("nombreUsuarioSSO") || "Usuario del Área";
  const areaGuardada = localStorage.getItem("areaUsuarioSSO");
  const areaUsuario = areaGuardada ? areaGuardada.toUpperCase() : (user?.email?.split('@')[0]?.toUpperCase() || "ÁREA");

  const [destinatario, setDestinatario] = useState("");
  const [caracter, setCaracter] = useState("Normal"); 
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState("");

  const [ticketsInternos, setTicketsInternos] = useState([]);
  const [cargandoGrilla, setCargandoGrilla] = useState(true);
  
  const [limite, setLimite] = useState(9);

  useEffect(() => {
    if (!areaUsuario) return;

    const q = query(
      collection(db, "intraTickets"),
      where("area", "==", areaUsuario),
      orderBy("fecha", "desc"),
      limit(limite)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTicketsInternos(
        snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data({ serverTimestamps: "estimate" }) 
        }))
      );
      setCargandoGrilla(false);
    }, (error) => {
      console.error("Error al cargar IntraTickets:", error);
      setCargandoGrilla(false);
    });

    return () => unsubscribe();
  }, [areaUsuario, limite]);

  useEffect(() => {
    if (cargandoGrilla || window.parent === window) return;

    const ticketsPendientes = ticketsInternos.filter(t => t.estado === "Pendiente");
    window.parent.postMessage({
      type: "ESTADO_TICKETS_PENDIENTES",
      sistema: "TICKETS_ASOEM",
      datos: {
        area: areaUsuario,
        cantidadPendientes: ticketsPendientes.length,
        
        detalle: ticketsPendientes.map(t => ({
          id: t.id,
          asunto: t.asunto,
          creadoPor: t.empleado,
          destinatario: t.destinatarioInterno,
          prioridad: t.caracter
        }))
      }
    }, "https://asoem.org.ar");

  }, [ticketsInternos, cargandoGrilla, areaUsuario]);
  const handleCrear = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensajeForm("Guardando tarea...");

    const codigoTicket = "INT-" + Math.floor(10000 + Math.random() * 90000); 

    try {
      await addDoc(collection(db, "intraTickets"), {
        area: areaUsuario,
        empleado: nombreRemitente, 
        destinatarioInterno: destinatario, 
        caracter, 
        asunto,
        descripcion,
        estado: "Pendiente",
        fecha: serverTimestamp(),
        codigo: codigoTicket
      });

      setMensajeForm("¡Tarea asignada con éxito!");
      setDestinatario("");
      setCaracter("Normal");
      setAsunto("");
      setDescripcion("");
      setTimeout(() => setMensajeForm(""), 4000);
    } catch (error) {
      console.error("Error al crear IntraTicket:", error);
      setMensajeForm("Error al guardar.");
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try { 
      await updateDoc(doc(db, "intraTickets", id), { estado: nuevoEstado }); 
    } catch (error) { 
      console.error("Error al actualizar:", error); 
    }
  };

  const eliminarTicket = async (id) => {
    if (window.confirm("¿Eliminar esta tarea interna permanentemente?")) {
      await deleteDoc(doc(db, "intraTickets", id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* SECCIÓN SUPERIOR: CREACIÓN */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Intra-Tickets: {areaUsuario}</h2>
          <p className="text-gray-500 text-sm mt-1">Asigná y gestioná tareas internas con tus compañeros de área.</p>
        </div>

        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">De (Remitente):</label>
              <input type="text" value={nombreRemitente} disabled className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Para (Compañero):</label>
              <input type="text" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder="..." className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none" required />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Prioridad:</label>
              <select value={caracter} onChange={(e) => setCaracter(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none">
                <option value="Normal">Normal</option>
                <option value="Prioritario">Prioritario</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Asunto / Tarea:</label>
            <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Breve descripción de la tarea..." className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none" required />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Detalle:</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="3" placeholder="Detalles o instrucciones..." className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none resize-none" required></textarea>
          </div>

          <div className="mt-2 flex items-center gap-4">
            <button type="submit" disabled={enviando} className="px-8 py-3 bg-amarillo-vivo hover:bg-amarillo-hover text-gray-900 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50">
              {enviando ? "Asignando..." : "Crear Tarea Interna"}
            </button>
            {mensajeForm && <span className="text-sm font-medium text-green-600">{mensajeForm}</span>}
          </div>
        </form>
      </section>

      {/* SECCIÓN INFERIOR: GRILLA */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Tablero de Tareas del Area</h3>
        
        {cargandoGrilla ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando tablero...</div>
        ) : ticketsInternos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            No hay tareas internas activas en el área.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketsInternos.map(t => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  
                  <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                          Para: {t.destinatarioInterno}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                          t.caracter === 'Urgente' ? 'bg-red-100 text-red-700' : 
                          t.caracter === 'Prioritario' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {t.caracter || 'Normal'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-base leading-tight mt-1">
                        {t.asunto}
                      </h3>
                    </div>
                    <button onClick={() => eliminarTicket(t.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2">
                      ✕
                    </button>
                  </div>

                  <div className="p-4 flex-grow">
                    <p className="text-xs text-gray-500 font-medium mb-2">Creado por: {t.empleado}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.descripcion}</p>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 mt-auto">
                    <div className="flex justify-between items-center text-[10px] font-medium">
                      <span className="text-gray-400">
                        {t.fecha?.toDate().toLocaleDateString()} - {t.fecha?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-2 py-1 rounded-md uppercase font-bold ${
                        t.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        t.estado === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>{t.estado}</span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {t.estado === "Pendiente" && (
                        <button onClick={() => cambiarEstado(t.id, "En Progreso")} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors">Empezar Tarea</button>
                      )}
                      {t.estado === "En Progreso" && (
                        <button onClick={() => cambiarEstado(t.id, "Completado")} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">Marcar como Completada</button>
                      )}
                      {t.estado === "Completado" && (
                        <button onClick={() => cambiarEstado(t.id, "Pendiente")} className="flex-1 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors">Reabrir Tarea</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ticketsInternos.length === limite && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setLimite(prev => prev + 9)} 
                  className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors shadow-sm"
                >
                  Cargar más tareas
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}