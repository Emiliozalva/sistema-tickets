import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logoAsoem.png"; 

export default function Navbar() {
  const { user } = useAuth();
  
  const areaGuardada = localStorage.getItem("areaUsuarioSSO");
  
  const areaUsuario = areaGuardada 
    ? areaGuardada.toUpperCase() 
    : user?.email?.split('@')[0]?.toUpperCase() || "ÁREA";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-amarillo-vivo shadow-sm z-50 flex items-center justify-between px-4 md:px-6 border-b border-yellow-200/50">
      
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        <h1 className="text-xl md:text-2xl font-normal text-gray-800 tracking-wide hidden sm:block">
          Sistema de Tickets
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right flex items-center gap-2">
          <p className="text-sm font-normal text-gray-600">Area:</p>
          <p className="text-sm font-medium text-gray-800 bg-white/50 border border-white/60 px-3 py-1 rounded-md shadow-sm">
            {areaUsuario}
          </p>
        </div>
      </div>
    </header>
  );
}