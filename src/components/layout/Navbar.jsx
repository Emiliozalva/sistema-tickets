import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logoAsoem.png"; 

export default function Navbar() {
  const { user } = useAuth();
  const areaUsuario = user?.email?.split('@')[0]?.toUpperCase() || "ÁREA";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-amarillo-vivo shadow-md z-50 flex items-center justify-between px-4 md:px-6">
      
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        <h1 className="text-lg md:text-xl font-extrabold text-gray-950 tracking-tight hidden sm:block">
          Sistema de Tickets
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800">Area:</p>
          <p className="text-sm font-bold text-gray-950 bg-white/60 px-2 py-1 rounded">
            {areaUsuario}
          </p>
        </div>
      </div>
    </header>
  );
}