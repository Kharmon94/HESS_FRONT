import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { ClientPortalPage } from "./pages/ClientPortalPage";
import { PortalDashboard } from "./pages/PortalDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClientProfile } from "./pages/ClientProfile";
import { ClientEdit } from "./pages/ClientEdit";
import { ResetPassword } from "./pages/ResetPassword";
import { RequireAdmin, RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "about",
        Component: About,
      },
      {
        path: "portal",
        Component: ClientPortalPage,
      },
      {
        path: "portal/dashboard",
        element: (
          <RequireAuth>
            <PortalDashboard />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/client/:id",
        element: (
          <RequireAdmin>
            <ClientProfile />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/client/:id/edit",
        element: (
          <RequireAdmin>
            <ClientEdit />
          </RequireAdmin>
        ),
      },
      {
        path: "reset-password",
        Component: ResetPassword,
      },
    ],
  },
]);