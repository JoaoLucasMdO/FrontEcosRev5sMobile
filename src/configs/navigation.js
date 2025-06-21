// Modificação para MainNavigation.js
import React from "react";
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { DrawerItemList } from "@react-navigation/drawer";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";

import HomeScreen from "../screens/HomeScreen";
import BeneficiosScreen from "../screens/BenefitsScreen";
import HistoricoScreen from "../screens/HistoryScreen";
import SobreScreen from "../screens/AboutScreen";
import PerfilScreen from "../screens/ProfileScreen";
import ConfigScreen from "../screens/ConfigScreen";
import QRCodeScannerScreen from "../screens/QRCodeScannerScreen";
import LoginScreen from "../screens/LoginScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import BottomNavigation from "../components/BottomNavigation";
import LogoutButton from "../components/LogoutButton";
import Header from "../components/AppHeader";
import { House, ArrowRightLeft, History, UserCog, Info, QrCode, LogIn, Settings } from "lucide-react-native";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export function TabScreens() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="BeneficiosTab" component={BeneficiosScreen} options={{ title: "Troca" }} />
      <Tab.Screen name="HistoricoTab" component={HistoricoScreen} options={{ title: "Histórico" }} />
      <Tab.Screen name="SobreTab" component={SobreScreen} options={{ title: "Sobre" }} />
      <Tab.Screen name="PerfilTab" component={PerfilScreen} options={{ title: "Perfil" }} />
      <Tab.Screen name="ResetTab" component={ResetPasswordScreen} options={{ title: "Reset" }} />
    </Tab.Navigator>
  );
}

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: false,
          // Prevent going back to login
          gestureEnabled: false
        }}
      />
    </Stack.Navigator>
  );
}

export function AppStack() {
  const theme = useTheme();
  const { fontSize, fontFamily } = useFontSettings();

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SafeAreaView style={[styles.drawerContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.drawerTitle, { 
              color: theme.colors.text.inverse, 
              fontSize: fontSize.xl,
              marginTop: 10,
            }]}>
              EcosRev
            </Text>
          </View>
          <View style={[styles.drawerDivider, { borderBottomColor: theme.colors.border }]} />
          <DrawerItemList {...props} />
          <View style={styles.logoutContainer}>
            <LogoutButton />
          </View>
        </SafeAreaView>
      )}
      screenOptions={{ 
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text.primary,
        drawerActiveBackgroundColor: `${theme.colors.primary}20`, // 20% de opacidade
        drawerInactiveBackgroundColor: 'transparent',
        drawerLabelStyle: {
          marginLeft: -5,
          fontSize: fontSize.md,
          fontWeight: '500',
          fontFamily: fontFamily,
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
          borderRightColor: theme.colors.border,
          borderRightWidth: 1,
        }
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabScreens} 
        options={{ 
          title: "Início", 
          drawerIcon: ({size}) => <House color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Perfil" 
        component={TabScreens} 
        options={{ 
          title: "Perfil",
          drawerIcon: ({size}) => <UserCog color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: "Entrar", 
          drawerIcon: ({size}) => <LogIn color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Troca" 
        component={TabScreens} 
        options={{ 
          title: "Troca",
          drawerIcon: ({size}) => <ArrowRightLeft color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="QrCode" 
        component={QRCodeScannerScreen} 
        options={{ 
          title: "QR Code",
          drawerIcon: ({size}) => <QrCode color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Historico" 
        component={TabScreens} 
        options={{ 
          title: "Histórico",
          drawerIcon: ({size}) => <History color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Sobre" 
        component={TabScreens} 
        options={{ 
          title: "Sobre",
          drawerIcon: ({size}) => <Info color="#14AE5C" size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="Configurações" 
        component={ConfigScreen} 
        options={{ 
          title: "Configurações",
          drawerIcon: ({size}) => <Settings color="#14AE5C" size={size} /> 
        }} 
      />
    </Drawer.Navigator>
  );
}

// Modificamos o fluxo para ter um Stack Navigator de alto nível
export function MainNavigation() {
  const { isAuthenticated } = useAuth();
  
  // Usamos um Stack Navigator principal para poder ter acesso a todas as telas
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="AppStack" component={AppStack} />
          {/* ResetPassword também precisa estar acessível quando autenticado */}
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ gestureEnabled: false }}
          />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 15, // Adicionado um pequeno padding para dar espaço ao topo
  },
  drawerHeader: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  drawerDivider: {
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  logoutContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
});
