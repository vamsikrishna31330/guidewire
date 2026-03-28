import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GetQuote from "./pages/GetQuote";
import Policy from "./pages/Policy";
import Claims from "./pages/Claims";
import AdminPanel from "./pages/AdminPanel";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-ink-pattern text-slate-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/get-quote" element={<GetQuote />} />
        <Route path="/policy" element={<ProtectedRoute><Policy /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
