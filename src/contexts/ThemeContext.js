//src\contexts\ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const ThemeContext = createContext();
// const THEME_KEY = 'app_theme';

// Definir um tema padrão para garantir que nunca seja undefined
const defaultTheme = lightTheme;

const ThemeContext = createContext({
  ...defaultTheme,
  themeMode: 'automatic',
  updateThemeMode: () => {},
});

const THEME_KEY = 'app_theme';

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light';
  const [themeMode, setThemeMode] = useState('automatic');
  const [currentTheme, setCurrentTheme] = useState(systemColorScheme === 'dark' ? { ...darkTheme } : { ...lightTheme });

  // Carregar preferência de tema do AsyncStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log('Erro ao carregar a preferência de tema no ThemeContext:', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    let newTheme;
    if (themeMode === 'dark') {
      newTheme = darkTheme;
    } else if (themeMode === 'light') {
      newTheme = lightTheme;
    } else {
      newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    // Garantir que todos os valores necessários estejam presentes
    if (!newTheme) {
      console.warn('Tema indefinido detectado, usando tema padrão');
      newTheme = { ...defaultTheme };
    }
    setCurrentTheme(newTheme);
  }, [themeMode, systemColorScheme]);

  const updateThemeMode = async (newMode) => {
    if (!newMode || !['light', 'dark', 'automatic'].includes(newMode)) {
      console.warn('Modo de tema inválido:', newMode);
      return;
    }
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
      setThemeMode(newMode);
    } catch (error) {
      console.log('Erro ao salvar a preferência de tema no ThemeContext:', error);
    } finally {
      console.log('Preferência de tema atualizada para:', newMode);
    }
  }; 

// Garantir que o valor do contexto nunca seja undefined
const contextValue = {
  ...(currentTheme || defaultTheme),
  themeMode,
  updateThemeMode
};

  return (
    // <ThemeContext.Provider value={{ ...currentTheme, themeMode, updateThemeMode }}>
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);

  // Verificação adicional para garantir que nunca retornamos undefined
  if (!theme) {
    console.warn('useTheme foi chamado fora do ThemeProvider ou o tema é undefined');
    return { ...defaultTheme, themeMode: 'automatic', updateThemeMode: () => {} };
  }
  
  return theme;
};