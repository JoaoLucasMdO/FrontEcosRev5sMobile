import React from "react";
import { StyleSheet, View, Text, StatusBar, Platform, SafeAreaView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animation from "./Animation";

const Header = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <StatusBar
        translucent
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: Platform.OS === 'ios' ? 120 : 110,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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