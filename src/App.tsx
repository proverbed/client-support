import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

// import Protected from "./pages/Protected.tsx";
import AuthContextProvider from "./store/AuthContextProvider.tsx";
import LogIn from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import RootLayout from "./pages/Root.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import QuizComponent from "./pages/QuizComponent.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthContextProvider>
        <LogIn />
      </AuthContextProvider>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <AuthContextProvider>
        <SignUp />
      </AuthContextProvider>
    ),
  },
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
        path: "/quiz/:id",
        element: <QuizComponent />,
      },
      { path: "/dashboard", element: <Dashboard /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
