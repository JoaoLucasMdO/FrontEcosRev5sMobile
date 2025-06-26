import React from "react";
import { SafeAreaView, View, StyleSheet, Text, BackHandler, TouchableOpacity } from "react-native";
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
import { IconButton } from "react-native-paper";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Telas públicas (sem autenticação) - apenas abas básicas
export function PublicTabScreens() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="SobreTab" component={SobreScreen} options={{ title: "Sobre" }} />
    </Tab.Navigator>
  );
}

// Telas autenticadas (com autenticação) - removida aba "Sobre" do bottom navigation
export function AuthenticatedTabScreens() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="BeneficiosTab" component={BeneficiosScreen} options={{ title: "Troca" }} />
      <Tab.Screen name="HistoricoTab" component={HistoricoScreen} options={{ title: "Histórico" }} />
      <Tab.Screen name="PerfilTab" component={PerfilScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}

// Stack de autenticação (login, cadastro, recuperação)
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
          gestureEnabled: false
        }}
      />
    </Stack.Navigator>
  );
}

// Componente personalizado para botão "Sair" no drawer público
function ExitButton() {
  const theme = useTheme();
  const { fontSize } = useFontSettings();
  
  const handleExit = () => {
    // Fechar o aplicativo
    BackHandler.exitApp();
  };

  return (
    <View style={styles.exitContainer}>
      <IconButton 
        icon="exit-to-app" 
        size={24} 
        iconColor="#14AE5C" 
        style={{ margin: 0 }}
        onPress={handleExit}
      />
      <Text style={[styles.exitText, { 
        color: theme.colors.text.primary, 
        fontSize: fontSize.md 
      }]}>
        Sair
      </Text>
    </View>
  );
}

// Drawer para usuários não autenticados (acesso limitado)
export function PublicDrawer() {
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
          <View style={styles.exitContainer}>
            <ExitButton />
          </View>
        </SafeAreaView>
      )}
      screenOptions={{ 
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text.primary,
        drawerActiveBackgroundColor: `${theme.colors.primary}20`,
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
        component={PublicTabScreens} 
        options={{ 
          title: "Início", 
          drawerIcon: ({size}) => <IconButton icon="home" size={size} iconColor="#14AE5C" style={{ margin: 0 }} /> 
        }} 
      />
      <Drawer.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: "Entrar", 
          drawerIcon: ({size}) => <IconButton icon="login" size={size} iconColor="#14AE5C" style={{ margin: 0 }} /> 
        }} 
      />
    </Drawer.Navigator>
  );
}

// Componente personalizado para o drawer que navega para abas específicas
function CustomDrawerContent(props) {
  const theme = useTheme();
  const { fontSize, fontFamily } = useFontSettings();
  
  const drawerItems = [
    { 
      label: 'Início', 
      icon: 'home', 
      onPress: () => {
        props.navigation.navigate('Main', { screen: 'HomeTab' });
        props.navigation.closeDrawer();
      }
    },
    { 
      label: 'Perfil', 
      icon: 'account-cog', 
      onPress: () => {
        props.navigation.navigate('Main', { screen: 'PerfilTab' });
        props.navigation.closeDrawer();
      }
    },
    { 
      label: 'Troca', 
      icon: 'swap-horizontal', 
      onPress: () => {
        props.navigation.navigate('Main', { screen: 'BeneficiosTab' });
        props.navigation.closeDrawer();
      }
    },
    { 
      label: 'Histórico', 
      icon: 'history', 
      onPress: () => {
        props.navigation.navigate('Main', { screen: 'HistoricoTab' });
        props.navigation.closeDrawer();
      }
    },
    { 
      label: 'QR Code', 
      icon: 'qrcode', 
      onPress: () => {
        props.navigation.navigate('QrCode');
        props.navigation.closeDrawer();
      }
    },
    { 
      label: 'Configurações', 
      icon: 'cog', 
      onPress: () => {
        props.navigation.navigate('Configurações');
        props.navigation.closeDrawer();
      }
    }
  ];

  return (
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
      
      {/* Custom drawer items */}
      <View style={{ flex: 1 }}>
        {drawerItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={item.onPress}
          >
            <IconButton 
              icon={item.icon} 
              size={24} 
              iconColor="#14AE5C" 
              style={{ margin: 0, marginRight: 10 }} 
            />
            <Text style={[
              styles.drawerItemText,
              { 
                color: theme.colors.text.primary, 
                fontSize: fontSize.md,
                fontFamily: fontFamily,
              }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
}
// Drawer para usuários autenticados (acesso completo)
export function AuthenticatedDrawer() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ 
        headerShown: false,
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
        component={AuthenticatedTabScreens} 
        options={{ 
          title: "Início", 
          drawerIcon: ({size}) => <IconButton icon="home" size={size} iconColor="#14AE5C" style={{ margin: 0 }} /> 
        }} 
      />
      <Drawer.Screen 
        name="QrCode" 
        component={QRCodeScannerScreen} 
        options={{ 
          title: "QR Code",
          drawerIcon: ({size}) => <IconButton icon="qrcode" size={size} iconColor="#14AE5C" style={{ margin: 0 }} /> 
        }} 
      />
      <Drawer.Screen 
        name="Configurações" 
        component={ConfigScreen} 
        options={{ 
          title: "Configurações",
          drawerIcon: ({size}) => <IconButton icon="cog" size={size} iconColor="#14AE5C" style={{ margin: 0 }} /> 
        }} 
      />
    </Drawer.Navigator>
  );
}

// Navegação principal que controla o fluxo baseado na autenticação
export function MainNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mostrar tela de loading enquanto verifica autenticação
  if (isLoading) {
    return null; // Ou uma tela de loading personalizada
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          {/* Usuário logado - acesso completo */}
          <Stack.Screen name="AuthenticatedApp" component={AuthenticatedDrawer} />
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ gestureEnabled: false }}
          />
        </>
      ) : (
        <>
          {/* Usuário não logado - acesso limitado */}
          <Stack.Screen name="PublicApp" component={PublicDrawer} />
          <Stack.Screen name="AuthStack" component={AuthStack} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Manter compatibilidade com código antigo
export function AppStack() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedDrawer /> : <PublicDrawer />;
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 15,
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
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  exitContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
});
