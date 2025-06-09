"use client"

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Layout from "../layout/Layout"
import Login from "@/pages/Login"
import Sale from "@/pages/Sale"
import Services from "@/pages/Services"
import Settings from "@/pages/Settings"
import Dashboard from "@/pages/Dashboard"
import Home2 from "@/pages/HomeN"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import type { JSX } from "react"
import { UserProvider } from "@/context/UserContext"
import ClientesPage from "@/pages/customer"
import ProductsPage from "@/pages/product"

function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" replace />
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
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/vendas" element={<Sale />} />
                            {/* Rotas de clientes */}
                            <Route path="/clientes" element={<ClientesPage />} />
                            <Route path="/clientes/novo" element={<ClientesPage />} />
                            <Route path="/clientes/:id" element={<ClientesPage />} />
                            <Route path="/produtos" element={<ProductsPage />} />
                            <Route path="/produtos/novo" element={<ProductsPage />} />
                            <Route path="/servicos" element={<Services />} />
                            <Route path="/configuracoes" element={<Settings />} />
                        </Route>
                    </Routes>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
