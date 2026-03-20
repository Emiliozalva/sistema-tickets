import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SidebarArea from "./SidebarArea";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-amarillo-pastel">
      <Navbar />
      <SidebarArea />
      
      
      <main className="pt-20 pb-24 px-4 md:pt-24 md:pl-72 md:pr-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}