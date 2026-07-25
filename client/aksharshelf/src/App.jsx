import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { routes } from "./routes/AppRoutes";
import Layout from "./components/layout/Layout";
import AdminRoutes from "./adminRoutes/adminRoute";
import Loader from "./components/Loader";
import GlobalLoaderManager from "./components/GlobalLoaderManager";

const AdminLogin = lazy(() => import("./admin/pages/adimLogin"));
const AdminDashboard = lazy(() => import("./admin/pages/adminDashboard"));
const AdminUser = lazy(() => import("./admin/pages/adminUser"));
const AdminBook = lazy(() => import("./admin/pages/adminBook"));
const AdminReview = lazy(() => import("./admin/pages/adminReview"));
const AdminAlgorithm = lazy(() => import("./admin/pages/adminAlgorithm"));
const AdminNotifications = lazy(() => import("./admin/pages/adminNotifications"));


function App() {
  return (
    <div className="w-full">
      <GlobalLoaderManager>
        <Suspense fallback={<Loader text="Loading page..." />}>
          <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoutes>
                <AdminDashboard />
              </AdminRoutes>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoutes>
                <AdminUser />
              </AdminRoutes>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoutes>
                <AdminBook />
              </AdminRoutes>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminRoutes>
                <AdminReview />
              </AdminRoutes>
            }
          />
          <Route
            path="/admin/algorithm"
            element={
              <AdminRoutes>
                <AdminAlgorithm />
              </AdminRoutes>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoutes>
                <AdminNotifications />
              </AdminRoutes>
            }
          />

          <Route path="/" element={<Layout />}>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Route>
          </Routes>
        </Suspense>
      </GlobalLoaderManager>
    </div>
  );
}

export default App;

