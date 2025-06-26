import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, BackHandler } from "react-native";
import { IconButton } from "react-native-paper";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";
import { useAuth } from "../contexts/AuthContext";
import CustomAlert from "./CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogoutButton = () => {
  const theme = useTheme();
  const { fontSize, fontFamily } = useFontSettings();
  const { logout } = useAuth();
  const [alertVisible, setAlertVisible] = useState(false);

  const handleExit = () => {
    setAlertVisible(true);
  };

  const confirmExit = async () => {
    try {
      // Usar o método logout do AuthContext
      await logout();
      // Remover dados adicionais do usuário
      await AsyncStorage.removeItem("user");
    } catch (e) {
      console.error("Erro ao fazer logout", e);
    } finally {
      setAlertVisible(false);
      // A navegação será automática devido à mudança do estado isAuthenticated
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handleExit}>
        <IconButton
          icon="logout"
          size={fontSize.md}
          iconColor={theme.colors.primary}
          style={[styles.icon, { margin: 0 }]}
        />
        <Text
          style={[
            styles.buttonText,
            {
              color: theme.colors.text.primary,
              fontSize: fontSize.md,
              fontFamily,
            },
          ]}
        >
          Sair
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmExit}
        title="Sair do App"
        message="Tem certeza de que deseja sair?"
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default LogoutButton;
