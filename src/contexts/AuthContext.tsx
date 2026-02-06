import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "mongodb_auth_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const { data, error } = await supabase.functions.invoke("mongodb-auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (error || data?.error) {
            console.log("Session invalid, clearing token");
            localStorage.removeItem(TOKEN_KEY);
          } else if (data?.user) {
            setUser(data.user);
          }
        } catch (err) {
          console.error("Session check error:", err);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("mongodb-auth/login", {
        body: { email, password },
      });

      if (error) {
        console.error("Sign in error:", error);
        return { error: error.message || "Failed to sign in" };
      }

      if (data?.error) {
        return { error: data.error };
      }

      if (data?.token && data?.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return {};
      }

      return { error: "Unknown error occurred" };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: "Failed to connect to authentication service" };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("mongodb-auth/register", {
        body: { email, password, fullName },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { error: error.message || "Failed to sign up" };
      }

      if (data?.error) {
        return { error: data.error };
      }

      if (data?.token && data?.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return {};
      }

      return { error: "Unknown error occurred" };
    } catch (err) {
      console.error("Sign up error:", err);
      return { error: "Failed to connect to authentication service" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
