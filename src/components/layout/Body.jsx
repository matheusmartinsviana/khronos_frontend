import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Body() {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    )
}