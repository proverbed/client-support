import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav/MainNav";
import { ColorModeContext, useMode } from "../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { UserAuth } from "../store/AuthContext";

function RootLayout() {
  const [theme, colorMode] = useMode();
  const { user } = UserAuth();

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {user?.displayName ? <Sidebar /> : null}

            <main className="content">
              {user?.displayName ? <Topbar /> : null}

              <Outlet />
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}

export default RootLayout;
