"use client"

import React, { createContext, useState, Dispatch, SetStateAction, ReactNode, useContext, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

export interface Workspace {
    id: number;
    name: string;
    owner_id: number;
    photo_url: string;
    subscription_id: number;
    user_role: string;
}
interface ContextProps {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
    workspaces: Workspace[];
    setWorkspaces: Dispatch<SetStateAction<Workspace[]>>;
}

export const Context = createContext<ContextProps | null>(null);

export function ContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>({
        id: "",
        name: "",
        email: "",
        avatar: "",
        role: "user"
    });
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        const currentUser = window.localStorage.getItem("user");
        const savedWorkspace = JSON.parse(window.localStorage.getItem('workspace') || '[]');

        if (currentUser) {
            setUser(JSON.parse(currentUser));
        }
        if (savedWorkspace) {
            setWorkspaces(savedWorkspace);
        }
    }, []);

    useEffect(() => {
        if (user.id != "") {
            window.localStorage.setItem("user", JSON.stringify(user));
        }
        if (workspaces.length) {
            window.localStorage.setItem('workspace', JSON.stringify(workspaces));
        }
    }, [user, workspaces]);

    return (
        <Context.Provider value={{ user, setUser, workspaces, setWorkspaces }}>
            {children}
        </Context.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useAppContext must be used within a ContextProvider");
    }
    return context;
};