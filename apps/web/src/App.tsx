import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { CalculatorPage } from "./pages/CalculatorPage";
import { History } from "./pages/History";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminUserDetail } from "./pages/admin/AdminUserDetail";
import { AdminAudit } from "./pages/admin/AdminAudit";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Pricing } from "./pages/Pricing";
import { Terms } from "./pages/Terms";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="calc" element={<Navigate to="/calc/concrete-volume" replace />} />
        <Route path="calc/:slug" element={<CalculatorPage />} />
        <Route path="history" element={<History />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="terms" element={<Terms />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
