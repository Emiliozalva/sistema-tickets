import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PanelArea() {
  const { user } = useAuth();
  
  const areaUsuario = user?.email?.split('@')[0]?.toUpperCase() || "ÁREA";

  const [dirigidoA, setDirigidoA] = useState("");
  const [caracter, setCaracter] = useState("Normal");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje("");

    // 1. AÑADIDO: Generamos un código único tipo "TK-48291"
    const codigoTicket = "TK-" + Math.floor(10000 + Math.random() * 90000); 

    try {
      await addDoc(collection(db, "tickets"), {
        area: areaUsuario,
        dirigidoA,
        caracter,
        asunto,
        descripcion,
        estado: "Pendiente",
        fecha: serverTimestamp(),
        codigo: codigoTicket // 2. AÑADIDO: Guardamos el código en Firebase
      });

      // 3. MODIFICADO: Le mostramos el código al usuario
      setMensaje(`¡Ticket enviado! Tu número de seguimiento es: ${codigoTicket}`); 
      
      setAsunto("");
      setDescripcion("");
      setDirigidoA("");
      setCaracter("Normal");
      setTimeout(() => setMensaje(""), 5000); // Le damos 5 segundos para que llegue a leerlo

    } catch (error) {
      console.error("Error al enviar el ticket:", error);
      setMensaje("Hubo un error al enviar el ticket.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Nuevo ticket
      </h2>
      
      <main className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-5 text-gray-700">Completar Datos</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Dirigido a:</label>
              <select 
                value={dirigidoA} 
                onChange={(e) => setDirigidoA(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none"
                required
              >
                <option value="" disabled>Seleccionar destinatario...</option>
                <option value="Ruben">Ruben</option>
                <option value="Mariano">Mariano</option>
                <option value="Diego">Diego</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Carácter:</label>
              <select 
                value={caracter} 
                onChange={(e) => setCaracter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Prioritario">Prioritario</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Asunto:</label>
            <input 
              type="text" 
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="..."
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Descripción:</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla el problema aquí..."
              rows="4"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none resize-none"
              required
            ></textarea>
          </div>

          <div className="mt-2">
            <button 
              type="submit" 
              disabled={enviando}
              className="w-full md:w-auto px-8 py-3 bg-amarillo-vivo hover:bg-amarillo-hover text-gray-900 font-bold rounded-xl transition-colors shadow disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar Ticket"}
            </button>
            
            {mensaje && (
              <p className={`mt-3 text-sm font-medium ${mensaje.includes("error") ? "text-red-500" : "text-green-600"}`}>
                {mensaje}
              </p>
            )}
          </div>

        </form>
      </main>
    </div>
  );
}