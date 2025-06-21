import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

const TOKEN_KEY = "token";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null); // Adicionando token ao estado

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          setToken(savedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (newToken) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Exportando também o contexto para manter compatibilidade com código existente
export { AuthContext };