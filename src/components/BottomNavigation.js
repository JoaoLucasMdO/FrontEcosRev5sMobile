import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from "../contexts/FontContext";
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomNavigation = ({ state, navigation }) => {
  const theme = useTheme();
  const { fontSize } = useFontSettings();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  // Abas para usuários não autenticados (limitadas)
  const publicTabs = [
    { name: "HomeTab", icon: "home", label: "Início" },
    { name: "SobreTab", icon: "information", label: "Sobre" },
    { name: "MenuTab", icon: "menu", label: "Menu", isDrawer: true },
  ];

  // Abas para usuários autenticados (completas) - removida aba "Sobre"
  const authenticatedTabs = [
    { name: "HomeTab", icon: "home", label: "Início" },
    { name: "BeneficiosTab", icon: "swap-horizontal", label: "Troca" },
    { name: "HistoricoTab", icon: "history", label: "Histórico" },
    { name: "PerfilTab", icon: "account-cog", label: "Perfil" },
    { name: "MenuTab", icon: "menu", label: "Menu", isDrawer: true },
  ];

  const tabs = isAuthenticated ? authenticatedTabs : publicTabs;

  const handleTabPress = (tab) => {
    if (tab.isDrawer) {
      openDrawer();
    } else {
      navigation.dispatch(CommonActions.navigate({ name: tab.name }));
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface, 
        borderTopColor: theme.colors.border,
        paddingBottom: Math.max(insets.bottom, 10)
      }
    ]}> 
      {tabs.map((tab) => {
        const isFocused = state.routes[state.index]?.name === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
          >
            <IconButton 
              icon={tab.icon} 
              size={24} 
              iconColor={isFocused ? theme.colors.primary : theme.colors.text.secondary} 
              style={{ margin: 0 }}
            />
            <Text style={[
              styles.tabLabel,
              { fontSize: fontSize.md, color: theme.colors.text.secondary },
              isFocused && { color: theme.colors.primary, fontWeight: 'bold' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 15,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default BottomNavigation;
