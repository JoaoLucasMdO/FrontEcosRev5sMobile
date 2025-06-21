import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { House, ArrowRightLeft, History, UserCog, Menu, Info } from "lucide-react-native";
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from "../contexts/FontContext";

const BottomNavigation = ({ state, navigation }) => {
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const tabs = [
    { name: "HomeTab", icon: House, label: "Início" },
    { name: "BeneficiosTab", icon: ArrowRightLeft, label: "Troca" },
    { name: "HistoricoTab", icon: History, label: "Histórico" },
    { name: "PerfilTab", icon: UserCog, label: "Perfil" },
    { name: "SobreTab", icon: Info, label: "Sobre" },
    { name: "MenuTab", icon: Menu, label: "Menu", isDrawer: true },
  ];

  const handleTabPress = (tab) => {
    if (tab.isDrawer) {
      openDrawer();
    } else {
      navigation.dispatch(CommonActions.navigate({ name: tab.name }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}> 
      {tabs.map((tab) => {
        const isFocused = state.routes[state.index]?.name === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
          >
            <tab.icon size={24} color={isFocused ? theme.colors.primary : theme.colors.text.secondary} />
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
    paddingVertical: 10,
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
