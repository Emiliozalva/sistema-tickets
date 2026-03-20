import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";

export default function SidebarArea() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const esAdmin = user?.email === "informatica@tickets.local";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const linkClass = ({ isActive }) => 
    `flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm transition-colors duration-200 
    ${isActive 
      ? "bg-amarillo-pastel text-gray-900 font-extrabold" 
      : "text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 flex flex-row justify-around items-center px-2 md:top-16 md:bottom-0 md:w-64 md:h-auto md:border-r md:border-t-0 md:flex-col md:justify-between md:px-4 md:py-6 md:items-stretch shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
      
      <nav className="flex flex-row justify-around w-full md:flex-col md:gap-2 md:justify-start">
        <p className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
          Navegación
        </p>

        {/* BOTÓN EXCLUSIVO PARA ADMIN */}
        {esAdmin && (
          <NavLink to="/admin" className={linkClass}>
            <span className="hidden md:inline">Panel informatica</span>
            <span className="md:hidden mt-0.5">Panel</span>
          </NavLink>
        )}

        <NavLink to="/panel" className={linkClass} end> 
          <span className="hidden md:inline">Crear Ticket</span>
          <span className="md:hidden mt-0.5">Crear Ticket</span>
        </NavLink>

        <NavLink to="/mis-tickets" className={linkClass}>
          <span className="hidden md:inline">Mis Tickets</span>
          <span className="md:hidden mt-0.5">Mis Tickets</span>
        </NavLink>
      </nav>

      <div className="flex items-center md:pt-4 md:mt-auto md:border-t md:border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 w-full rounded-lg text-xs md:text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          
          <span className="hidden md:inline">Cerrar Sesión</span>
          <span className="md:hidden mt-0.5">Salir</span>
        </button>
      </div>
    </aside>
  );
}