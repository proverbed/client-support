import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import TradeDetailsPage from './pages/TradeDetailsPage.tsx';
import RootLayout from './pages/Root.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

import Protected from './pages/Protected.tsx';
import Account from './pages/account/index.tsx';
import Invoices from './pages/invoices/index.tsx';
import Contacts from './pages/contacts/index.tsx';
import FAQ from './pages/faq/index.tsx';
import Form from './pages/form/index.tsx';
import Calendar from './pages/calendar/calendar.tsx';
import Bar from './pages/bar/index.tsx';
import Pie from './pages/pie/index.tsx';
import Dashboard from './pages/dashboard/index.tsx';
import AccountDashboard from './pages/accountDashboard/index.tsx';
import AuthContextProvider from './store/AuthContextProvider.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthContextProvider>
        <RootLayout />
      </AuthContextProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/trade/:tradeId',
        element: (
          <Protected>
            <TradeDetailsPage />
          </Protected>
        ),
      },
      {
        path: '/dashboard/:accountId',
        element: (
          <Protected>
            <AccountDashboard />
          </Protected>
        ),
      },
      {
        path: '/account',
        element: (
          <Protected>
            <Account />
          </Protected>
        ),
      },
      {
        path: '/invoices',
        element: (
          <Protected>
            <Invoices />
          </Protected>
        ),
      },
      {
        path: '/contacts',
        element: (
          <Protected>
            <Contacts />
          </Protected>
        ),
      },
      {
        path: '/faq',
        element: (
          <Protected>
            <FAQ />
          </Protected>
        ),
      },
      {
        path: '/form',
        element: (
          <Protected>
            <Form />
          </Protected>
        ),
      },
      {
        path: '/calendar',
        element: (
          <Protected>
            <Calendar />
          </Protected>
        ),
      },
      {
        path: '/bar',
        element: (
          <Protected>
            <Bar />
          </Protected>
        ),
      },
      {
        path: '/pie',
        element: (
          <Protected>
            <Pie />
          </Protected>
        ),
      },
      {
        path: '/dash',
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
