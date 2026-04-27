"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  nome: string;
  apelido: string;
  dataNascimento: string;
}

interface UserContextType {
  userData: UserData;
  setUserData: (data: UserData) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    nome: "",
    apelido: "",
    dataNascimento: "",
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
