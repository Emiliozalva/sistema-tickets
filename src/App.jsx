import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

const Login = lazy(() => import("./pages/Login"));
const PanelArea = lazy(() => import("./pages/PanelArea"));
const MisTickets = lazy(() => import("./pages/MisTickets"));
const DashboardIT = lazy(() => import("./pages/DashboardIT"));
const CargandoPantalla = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="text-gray-500 font-medium animate-pulse">Cargando módulo...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<CargandoPantalla />}>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="panel" element={<PanelArea />} />
              <Route path="mis-tickets" element={<MisTickets />} />
              <Route path="admin" element={<DashboardIT />} /> 
            </Route>

            <Route path="*" element={<h1>Error 404: Página no encontrada</h1>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;