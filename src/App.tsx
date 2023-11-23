// import { CORE_CONCEPTS } from './data';
// import Header from './components/Header/Header';
// import CoreConcept from './components/Header/CoreConcepts';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TradeDetailsPage from "./pages/TradeDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/trade-details', element: <TradeDetailsPage /> }
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
