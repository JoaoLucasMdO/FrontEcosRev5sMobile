// App.js
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { FontSettingsProvider } from "./src/contexts/FontContext";
import LoadingScreen from "./src/screens/LoadingScreen";
import { MainNavigation } from "./src/configs/navigation";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from "./src/contexts/AuthContext";
import Header from './src/components/AppHeader';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <AuthProvider>
        <ThemeProvider>
          <FontSettingsProvider>
            <PaperProvider>
              <LoadingScreen />
            </PaperProvider>
          </FontSettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <FontSettingsProvider>
          <PaperProvider>
            <SafeAreaProvider>
              <Header />
              <NavigationContainer>
                <MainNavigation />
              </NavigationContainer>
            </SafeAreaProvider>
          </PaperProvider>
        </FontSettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}