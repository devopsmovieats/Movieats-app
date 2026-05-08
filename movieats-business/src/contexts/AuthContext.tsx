"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Cookies from "js-cookie";

type Profile = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'COZINHA' | 'ENTREGADOR';
  establishment_id: string;
  status: boolean;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  establishmentId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  establishmentId: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bd_perfis")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error("Erro crítico ao buscar perfil:", err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Verificar sessão inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        
        // Sincronizar LocalStorage para compatibilidade legada
        if (userProfile) {
          localStorage.setItem("movieats_user", JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: userProfile.role,
            name: userProfile.nome,
            establishment_id: userProfile.establishment_id
          }));
          Cookies.set("auth_token", "movieats-store-session", { expires: 1 });
        }
      }
      setLoading(false);
    };

    initAuth();

    // 2. Ouvir mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        
        if (userProfile) {
          localStorage.setItem("movieats_user", JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: userProfile.role,
            name: userProfile.nome,
            establishment_id: userProfile.establishment_id
          }));
          Cookies.set("auth_token", "movieats-store-session", { expires: 1 });
        }
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("movieats_user");
        Cookies.remove("auth_token");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem("movieats_user");
    Cookies.remove("auth_token");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      establishmentId: profile?.establishment_id || null, 
      loading,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
