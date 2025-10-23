//src\screens\ConfigScreen.js
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConfigScreen = () => {
  const { colors, themeMode, updateThemeMode, spacing } = useTheme();
  const { fontSize, updateFontSize, fontPreference, updateFontPreference } = useFontSettings();
  const [currentThemeMode, setCurrentThemeMode] = useState(themeMode);
  const [currentFontPreference, setCurrentFontPreference] = useState(fontPreference);
  const appVersion = "0.1.0-beta";
  const navigation = useNavigation();

  useEffect(() => {
    setCurrentThemeMode(themeMode);
    setCurrentFontPreference(fontPreference);
  }, [themeMode, fontPreference]);

  const handleThemeChange = (mode) => {
    setCurrentThemeMode(mode);
    updateThemeMode(mode);
  };

  const handleFontSizeChange = (size) => {
    updateFontSize(size);
  };

  const handleFontPreferenceChange = (font) => {
    setCurrentFontPreference(font);
    updateFontPreference(font);
  };

  const getRadioButtonStyle = (isSelected) => {
    const borderColor = themeMode === 'dark' ? '#fff' : '#000';
    const backgroundColor = isSelected ? colors.primary : 'transparent';

    return {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      borderColor: borderColor,
      backgroundColor: backgroundColor,
    };
  };

  return (
  <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView>
        <Text style={[styles.title, { color: colors.primary, fontSize: fontSize.lg }]}>Configurações</Text>

        {/* Opção de Tema */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: fontSize.md }]}>Tema</Text>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Automático</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentThemeMode === "automatic")}
              onPress={() => handleThemeChange("automatic")}
            />
          </View>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Claro</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentThemeMode === "light")}
              onPress={() => handleThemeChange("light")}
            />
          </View>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Escuro</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentThemeMode === "dark")}
              onPress={() => handleThemeChange("dark")}
            />
          </View>
        </View>

        {/* Opção de Tamanho da Fonte */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: fontSize.md }]}>Tamanho da Fonte</Text>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Pequeno</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentFontPreference === "small")}
              onPress={() => handleFontPreferenceChange("small")}
            />
          </View>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Médio</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentFontPreference === "medium")}
              onPress={() => handleFontPreferenceChange("medium")}
            />
          </View>
          <View style={[styles.optionRow, { borderColor: colors.border }]}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Grande</Text>
            <TouchableOpacity
              style={getRadioButtonStyle(currentFontPreference === "large")}
              onPress={() => handleFontPreferenceChange("large")}
            />
          </View>
        </View>

        {/* Versão do App */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: fontSize.md }]}>Versão do App</Text>
          <Text style={[styles.optionText, { color: colors.text.secondary, fontSize: fontSize.sm }]}>{appVersion}</Text>
        </View>

        {/* Contato / Suporte */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: fontSize.md }]}>Contato / Suporte</Text>
          <TouchableOpacity style={[styles.optionRow, { borderColor: colors.border }]} onPress={async () => {
            const email = 'ecosrev.suporte@gmail.com';
            const subject = encodeURIComponent('Contato - Suporte EcosRev');
            // tentar ler dados do usuário armazenados localmente
            let userInfo = { nome: '', email: '', id: '' };
            try {
              const storedUser = await AsyncStorage.getItem('user');
              if (storedUser) {
                const parsed = JSON.parse(storedUser);
                userInfo.nome = parsed.nome || parsed.name || '';
                userInfo.email = parsed.email || '';
                userInfo.id = parsed._id || parsed.id || '';
              }
            } catch (err) {
              console.warn('Não foi possível ler usuário do AsyncStorage:', err);
            }
            const bodyText = `Olá, preciso de suporte.\n\nNome: ${userInfo.nome}\nEmail: ${userInfo.email}\nID do usuário: ${userInfo.id}\n\nDescreva seu problema:`;
            const body = encodeURIComponent(bodyText);
            const url = `mailto:${email}?subject=${subject}&body=${body}`;
            try {
              const can = await Linking.canOpenURL(url);
              if (can) await Linking.openURL(url);
            } catch (err) {
              console.error('Erro ao abrir email:', err);
            }
          }}>
            <Text style={[styles.optionText, { color: colors.text.primary, fontSize: fontSize.sm }]}>Enviar email para suporte</Text>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

    {/* Botão de Voltar para Tela Inicial */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            style={styles.backHomeButton}
        >
            <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
            <Text style={[styles.backHomeText, { color: colors.text.primary, fontSize: fontSize.sm }]}>
                Voltar para tela inicial
            </Text>
        </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  backHomeText: {
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});

export default ConfigScreen;