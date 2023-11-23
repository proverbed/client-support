import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TradeDetailsPage from "./pages/TradeDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/ErrorPage";
import SignInPage from "./pages/SignInPage";
import { AuthContextProvider } from "./store/AuthContext";
import Protected from "./pages/Protected";

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthContextProvider><RootLayout /></AuthContextProvider>,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/dashboard', element: <Protected><DashboardPage /></Protected> },
      { path: '/trade-details', element: <Protected><TradeDetailsPage /></Protected> }
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
