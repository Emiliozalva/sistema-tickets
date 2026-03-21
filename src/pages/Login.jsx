import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const emailFicticio = `${username.toLowerCase()}@tickets.local`;
      await signInWithEmailAndPassword(auth, emailFicticio, password);
      
      if (emailFicticio === "informatica@tickets.local") {
        navigate("/admin");
      } else {
        navigate("/panel");
      }
    } catch (error) {
      console.error("Error de login:", error);
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen bg-amarillo-pastel flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
        
        
        <img 
          src="/logoAsoem.png" 
          alt="Logo ASOEM" 
          className="w-32 mx-auto mb-4 object-contain" 
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Tickets</h2>
        <p className="text-gray-500 text-sm mb-6">Ingresa con tu usuario asignado</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Area (ej: finanzas)"
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