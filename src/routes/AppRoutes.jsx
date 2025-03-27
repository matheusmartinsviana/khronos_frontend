import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Body from "../components/layout/Body";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Body />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
