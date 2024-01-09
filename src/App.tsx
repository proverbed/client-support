import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TradeDetailsPage from "./pages/TradeDetailsPage";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/ErrorPage";
import { AuthContextProvider } from "./store/AuthContext";
import Protected from "./pages/Protected";
import Account from "./pages/account";
import Invoices from "./pages/invoices";
import Contacts from "./pages/contacts";
import FAQ from "./pages/faq";
import Form from "./pages/form";
import Calendar from "./pages/calendar/calendar";
import Bar from "./pages/bar";
import Line from "./pages/line";
import Pie from "./pages/pie";
import Dashboard from "./pages/dashboard";
import NumTrades from "./pages/numTrades";

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
        path: "/account",
        element: (
          <Protected>
            <Account />
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
      {
        path: "/faq",
        element: (
          <Protected>
            <FAQ />
          </Protected>
        ),
      },
      {
        path: "/form",
        element: (
          <Protected>
            <Form />
          </Protected>
        ),
      },
      {
        path: "/calendar",
        element: (
          <Protected>
            <Calendar />
          </Protected>
        ),
      },
      {
        path: "/bar",
        element: (
          <Protected>
            <Bar />
          </Protected>
        ),
      },
      {
        path: "/line",
        element: (
          <Protected>
            <Line />
          </Protected>
        ),
      },
      {
        path: "/numTrades",
        element: (
          <Protected>
            <NumTrades />
          </Protected>
        ),
      },
      {
        path: "/pie",
        element: (
          <Protected>
            <Pie />
          </Protected>
        ),
      },
      {
        path: "/dash",
        element: (
          <Protected>
            <Dashboard />
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
