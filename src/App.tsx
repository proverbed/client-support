import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TradeDetailsPage from "./pages/TradeDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/ErrorPage";
import { AuthContextProvider } from "./store/AuthContext";
import Protected from "./pages/Protected";
import Team from "./pages/team";
import Invoices from "./pages/invoices";
import Contacts from "./pages/contacts";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthContextProvider>
        <RootLayout />
      </AuthContextProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        path: "/trade/:tradeId",
        element: (
          <Protected>
            <TradeDetailsPage />
          </Protected>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <Protected>
            <DashboardPage />
          </Protected>
        ),
      },
      {
        path: "/team",
        element: (
          <Protected>
            <Team />
          </Protected>
        ),
      },
      {
        path: "/invoices",
        element: (
          <Protected>
            <Invoices />
          </Protected>
        ),
      },
      {
        path: "/contacts",
        element: (
          <Protected>
            <Contacts />
          </Protected>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
