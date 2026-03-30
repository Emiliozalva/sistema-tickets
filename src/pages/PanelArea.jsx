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
  
  const [imagenes, setImagenes] = useState([]);
  
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  
  const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    if (!file) return;

    if (imagenes.length >= 3) {
      alert("Ya has alcanzado el máximo de 3 imágenes.");
    } else {
      
      setImagenes(prev => [...prev, file]);
    }
    
    
    e.target.value = ""; 
  };

  
  const eliminarImagen = (indexAEliminar) => {
    setImagenes(prev => prev.filter((_, index) => index !== indexAEliminar));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje("Procesando ticket...");

    const codigoTicket = "TK-" + Math.floor(10000 + Math.random() * 90000); 
    const nombreEmpleado = localStorage.getItem("nombreUsuarioSSO") || "Usuario del Área";
    
    let imagenesUrls = [];

    try {
      if (imagenes.length > 0) {
        setMensaje(`Subiendo ${imagenes.length} captura(s)...`);
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY; 

        for (const img of imagenes) {
          const formData = new FormData();
          formData.append("image", img);

          const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          
          if (data.success) {
            imagenesUrls.push(data.data.url);
          }
        }
      }

      setMensaje("Guardando ticket...");
      await addDoc(collection(db, "tickets"), {
        area: areaUsuario,
        empleado: nombreEmpleado, 
        dirigidoA,
        caracter,
        asunto,
        descripcion,
        estado: "Pendiente",
        validacion: "Pendiente",
        fecha: serverTimestamp(),
        codigo: codigoTicket,
        imagenesUrls: imagenesUrls 
      });

      setMensaje(`¡Ticket enviado! Tu número de seguimiento es: ${codigoTicket}`);
      
      setAsunto("");
      setDescripcion("");
      setDirigidoA("");
      setCaracter("Normal");
      setImagenes([]); 
      setTimeout(() => setMensaje(""), 6000);

    } catch (error) {
      console.error("Error al enviar el ticket:", error);
      setMensaje("Hubo un error al enviar el ticket.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo ticket</h2>
      
      <main className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Dirigido a:</label>
              <select value={dirigidoA} onChange={(e) => setDirigidoA(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none" required>
                <option value="" disabled>Seleccionar destino...</option>
                <option value="Sistema">Sistema</option>
                <option value="Soporte">Soporte</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Carácter:</label>
              <select value={caracter} onChange={(e) => setCaracter(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none">
                <option value="Normal">Normal</option>
                <option value="Prioritario">Prioritario</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Asunto:</label>
            <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="..." className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none" required />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Descripción:</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalla el problema aquí..." rows="4" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo-vivo outline-none resize-none" required></textarea>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Adjuntar capturas (Máx 3):</label>
            <input 
              id="inputImagenes"
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              disabled={imagenes.length >= 3} 
              className="p-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amarillo-pastel file:text-yellow-800 hover:file:bg-amarillo-vivo transition-all disabled:opacity-50" 
            />
            
            
            {imagenes.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-500">Imágenes seleccionadas ({imagenes.length}/3):</p>
                {imagenes.map((img, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-600 truncate max-w-[200px] md:max-w-md">{img.name}</span>
                    <button 
                      type="button" 
                      onClick={() => eliminarImagen(index)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2"
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2">
            <button type="submit" disabled={enviando} className="w-full md:w-auto px-8 py-3 bg-amarillo-vivo hover:bg-amarillo-hover text-gray-900 font-bold rounded-xl transition-colors shadow disabled:opacity-50">
              {enviando ? "Enviando..." : "Enviar Ticket"}
            </button>
            {mensaje && <p className={`mt-3 text-sm font-medium ${mensaje.includes("error") ? "text-red-500" : "text-green-600"}`}>{mensaje}</p>}
          </div>
        </form>
      </main>
    </div>
  );
}