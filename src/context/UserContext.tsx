import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/api";
import { useAuth } from "./AuthContext";

interface User {
    user_id: number;
    name: string;
    email: string;
    // adicione outros campos conforme sua API
}

interface UserContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
    loadingUser: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                setUser(null);
                setLoadingUser(false);
                return;
            }

            try {
                const response = await api.get("/user/info");
                setUser(response.data);
            } catch (error) {
                console.error("Erro ao buscar info do usuário:", error);
                setUser(null);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserInfo();
    }, [token]);

    return (
        <UserContext.Provider value={{ user, setUser, loadingUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
