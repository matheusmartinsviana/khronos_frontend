import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Login from "@/pages/Login";
import Sale from "@/pages/Sale";
import Customers from "@/pages/Customers";
import Services from "@/pages/Services";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import AddCustomer from "@/pages/AddCustomer";
import Home2 from "@/pages/HomeN";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { JSX } from "react";
import { UserProvider } from "@/context/UserContext";

function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <UserProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home2 />} />
                        <Route
                            element={
                                <PrivateRoute>
                                    <Layout />
                                </PrivateRoute>
                            }
                        >
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/venda" element={<Sale />} />
                            <Route path="/clientes" element={<Customers />} />
                            <Route path="/clientes/add" element={<AddCustomer />} />
                            <Route path="/servicos" element={<Services />} />
                            <Route path="/produtos" element={<Products />} />
                            <Route path="/configuracoes" element={<Settings />} />
                        </Route>
                    </Routes>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
