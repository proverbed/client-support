import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav/MainNav";
import classes from './Root.module.css';

function RootLayout() {
    return (
        <>
            <MainNav />
            <main className={classes.content}>
            <Outlet />
            </main>
            
        </>
    )
}

export default RootLayout;