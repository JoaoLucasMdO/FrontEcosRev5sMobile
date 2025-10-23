import React from "react";
import { StyleSheet, View, Text, StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../contexts/ThemeContext";
import Animation from "./Animation";

const Header = () => {
  const theme = useTheme();
  // useSafeAreaInsets não é necessário quando usamos SafeAreaView
  return (
    <SafeAreaView
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <StatusBar
        translucent={false}
        backgroundColor={theme.colors.statusbar}
        barStyle={theme.statusBarStyle || "light-content"}
      />

  <View style={styles.contentContainer}>
        {/* Animação alinhada à esquerda */}
        <View style={styles.animationContainer}>
          <Animation />
        </View>

        {/* Texto "EcosRev" alinhado à direita */}
        <Text style={[styles.headerText, { color: theme.colors.text.primary }]}>
          EcosRev
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: Platform.OS === 'ios' ? 52 : 48,
    paddingVertical: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  animationContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;