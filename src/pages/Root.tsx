import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import { UserAuth } from "../AuthContext";

function RootLayout() {
  const { user } = UserAuth();

  return (
    <div className="app">
      {user?.displayName ? <UserHeader /> : <Header />}

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
