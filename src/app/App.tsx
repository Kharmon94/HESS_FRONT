import { RouterProvider } from "react-router";
import { router } from "./routes";
import { InquiryProvider } from "./contexts/InquiryContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InquiryProvider>
          <RouterProvider router={router} />
        </InquiryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}