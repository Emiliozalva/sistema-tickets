import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SidebarArea() {
  const { user } = useAuth();
  
  const esAdmin = user?.email?.includes("informatica");

  const linkClass = ({ isActive }) => 
    `flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm transition-colors duration-200 
    ${isActive 
      ? "bg-amarillo-pastel text-gray-900 font-extrabold" 
      : "text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 flex flex-row justify-around items-center px-2 md:top-16 md:bottom-0 md:w-64 md:h-auto md:border-r md:border-t-0 md:flex-col md:justify-start md:px-4 md:py-6 md:items-stretch shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
      
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

        
        <NavLink to="/intra-tickets" className={linkClass}>
          <span className="hidden md:inline">IntraTickets</span>
          <span className="md:hidden mt-0.5">Internos</span>
        </NavLink>

        <NavLink to="/panel" className={linkClass} end> 
          <span className="hidden md:inline">Crear Ticket</span>
          <span className="md:hidden mt-0.5">Crear Ticket</span>
        </NavLink>

        <NavLink to="/mis-tickets" className={linkClass}>
          <span className="hidden md:inline">Mis Tickets</span>
          <span className="md:hidden mt-0.5">Mis Tickets</span>
        </NavLink>
      </nav>

    </aside>
  );
}