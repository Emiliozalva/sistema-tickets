import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const params = new URLSearchParams(window.location.search);
  const hasToken = !!params.get("ov_token");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargandoAutomatico, setCargandoAutomatico] = useState(hasToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasToken) {
      const token = params.get("ov_token");
      procesarLoginAutomatico(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const procesarLoginAutomatico = async (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const dataUsuario = payload.usuario;

      if (!dataUsuario || !dataUsuario.area || dataUsuario.area.trim() === "") {
        throw new Error("El token no contiene un área válida.");
      }

      if (dataUsuario.nombre) {
        localStorage.setItem("nombreUsuarioSSO", dataUsuario.nombre);
      }

      const areaFormateada = dataUsuario.area
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');

      const emailFicticio = `${areaFormateada}@tickets.local`;
      const passwordAutomatica = `${areaFormateada}tickets314`;

      await signInWithEmailAndPassword(auth, emailFicticio, passwordAutomatica);
      
      if (emailFicticio.includes("informatica")) {
        navigate("/admin");
      } else {
        navigate("/panel");
      }

    } catch (error) {
      console.error("ERROR EN LOGIN AUTOMÁTICO:", error.message);
      setError("Sesión expirada o inválida. Por favor ingrese manualmente.");
      setCargandoAutomatico(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const areaFormateada = username.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
      const emailFicticio = `${areaFormateada}@tickets.local`;
      
      await signInWithEmailAndPassword(auth, emailFicticio, password);
      
      if (emailFicticio.includes("informatica")) {
        navigate("/admin");
      } else {
        navigate("/panel");
      }
    } catch (error) {
      console.error("Error de login manual:", error);
      setError("Área o contraseña incorrectos.");
    }
  };

  if (cargandoAutomatico) {
    return (
      <div className="min-h-screen bg-amarillo-pastel flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
          <img src="/logoAsoem.png" alt="Logo ASOEM" className="w-24 mx-auto mb-6 object-contain animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amarillo-vivo mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-sm">Conectando con la Oficina Virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amarillo-pastel flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
        
        <img 
          src="/logoAsoem.png" 
          alt="Logo ASOEM" 
          className="w-32 mx-auto mb-4 object-contain" 
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Tickets</h2>
        <p className="text-gray-500 text-sm mb-6">Ingresa con el usuario de tu área</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Área (ej: finanzas)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amarillo-vivo transition-all text-sm"
            required
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amarillo-vivo transition-all text-sm"
            required
          />

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-amarillo-vivo hover:bg-amarillo-hover text-gray-900 font-bold rounded-lg transition-colors duration-200 shadow-sm"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}