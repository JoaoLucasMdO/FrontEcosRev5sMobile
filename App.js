// App.js
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { FontSettingsProvider } from "./src/contexts/FontContext";
import LoadingScreen from "./src/screens/LoadingScreen";
import { AppStack} from "./src/configs/navigation";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from "./src/contexts/AuthContext";

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
            <NavigationContainer>
              <AppStack />
            </NavigationContainer>
          </PaperProvider>
        </FontSettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}