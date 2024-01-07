import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav/MainNav";
import { ColorModeContext, useMode } from "../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Topbar from "./global/Topbar";
import MySidebar from "./global/Sidebar";

function RootLayout() {
  const [theme, colorMode] = useMode();

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <MySidebar />

            <main className="content">
              <MainNav />
              <Topbar />
              <Outlet />
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}

export default RootLayout;
