import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api"; // axios configurado
import { LoadingWithLogo } from "@/components/shared/Loading";

interface AuthContextProps {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <LoadingWithLogo />; // loader personalizado
    }

    const login = (newToken: string) => {
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        navigate("/");
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common["Authorization"];
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, token, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
