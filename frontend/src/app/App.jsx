// frontend/src/App.jsx
import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Evaluator pages
import PhysicalFitness from "../features/evaluator/pages/PhysicalFitnessPage.jsx";
import Results from "../features/evaluator/pages/ResultsPage.jsx";
import Login from "../features/evaluator/pages/LoginPage.jsx";

// Admin pages
import AdminLogin from "../features/admin/pages/AdminLoginPage.jsx";
import AdminDashboard from "../features/admin/pages/AdminDashboardPage.jsx";
import AdminAnalytics from "../features/admin/pages/AnalyticsPage.jsx";
import PersonnelList from "../features/admin/pages/PersonnelListPage.jsx";
import PersonnelDetails from "../features/admin/pages/PersonnelDetailsPage.jsx";
import PersonnelEdit from "../features/admin/pages/PersonnelEditPage.jsx";

// Super-admin pages
import SuperAdminLogin from "../features/superadmin/pages/SuperAdminLoginPage.jsx";
import SuperAdminDashboard from "../features/superadmin/pages/SuperAdminDashboardPage.jsx";
import SuperAdminAnalytics from "../features/superadmin/pages/AnalyticsPage.jsx";
import EvaluatorsList from "../features/superadmin/pages/EvaluatorsListPage.jsx";
import AdminsList from "../features/superadmin/pages/AdminsListPage.jsx";
import CreateEvaluator from "../features/superadmin/pages/CreateEvaluatorPage.jsx";
import CreateAdmin from "../features/superadmin/pages/CreateAdminPage.jsx";
import EvaluatorDetails from "../features/superadmin/pages/EvaluatorDetailsPage.jsx";
import AdminDetails from "../features/superadmin/pages/AdminDetailsPage.jsx";
import PFTResultsList from "../features/superadmin/pages/PFTResultsListPage.jsx";

import Certificate from "../features/certificates/pages/CertificatePage.jsx";
import AdminProtectedRoute from "../features/admin/components/AdminProtectedRoute.jsx";
import SuperAdminProtectedRoute from "../features/superadmin/components/SuperAdminProtectedRoute.jsx";
import {
  EvaluatorProtectedRoute,
  LoginRedirect,
  AuthRefreshIndicator,
} from "../features/auth/components/RouteGuards.jsx";

// Main App Routes
export default function App() {
  return (
    <>
      <AuthRefreshIndicator />
      <Routes>
      {/* SUPER ADMIN ROUTES */}
      <Route
        path="/superadmin/login"
        element={
          <LoginRedirect>
            <SuperAdminLogin />
          </LoginRedirect>
        }
      />

      <Route element={<SuperAdminProtectedRoute />}>
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/analytics" element={<SuperAdminAnalytics />} />
        <Route path="/superadmin/evaluators" element={<EvaluatorsList />} />
        <Route path="/superadmin/evaluators/create" element={<CreateEvaluator />} />
        <Route path="/superadmin/evaluators/:id" element={<EvaluatorDetails />} />
        <Route path="/superadmin/admins" element={<AdminsList />} />
        <Route path="/superadmin/admins/create" element={<CreateAdmin />} />
        <Route path="/superadmin/admins/:id" element={<AdminDetails />} />
        <Route path="/superadmin/pft-results" element={<PFTResultsList />} />

        {/* Personnel / Result Detail & Edit */}
        <Route path="/superadmin/participants/:id" element={<PersonnelDetails fromSuperAdmin={true} />} />
        <Route path="/superadmin/pft-results/:id/edit" element={<PersonnelEdit fromSuperAdmin={true} />} />

        {/* CERTIFICATE ROUTE - SUPER ADMIN */}
        <Route
          path="/superadmin/pft-results/:id/certificate"
          element={<Certificate fromSuperAdmin={true} />}
        />
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/login"
        element={
          <LoginRedirect>
            <AdminLogin />
          </LoginRedirect>
        }
      />

      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/personnel" element={<PersonnelList />} />

        {/* Personnel / Result Detail & Edit */}
        <Route path="/admin/personnel/:id" element={<PersonnelDetails fromSuperAdmin={false} />} />
        <Route path="/admin/personnel/:id/edit" element={<PersonnelEdit fromSuperAdmin={false} />} />

        {/* CERTIFICATE ROUTE - ADMIN */}
        <Route
          path="/admin/personnel/:id/certificate"
          element={<Certificate fromSuperAdmin={false} />}
        />
      </Route>

      {/*= EVALUATOR ROUTES (RESTRICTED) */}
      <Route
        path="/login"
        element={
          <LoginRedirect>
            <Login />
          </LoginRedirect>
        }
      />

      {/* ✅ MODIFIED: Only evaluators can access these routes */}
      <Route element={<EvaluatorProtectedRoute />}>
        <Route path="/" element={<PhysicalFitness />} />
        <Route path="/results" element={<Results />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}