//src\screens\AboutScreen.js
import React from "react";
import { StyleSheet, Text, View, ScrollView, Linking } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";
import { SafeAreaView } from "react-native-safe-area-context";

const AboutScreen = () => {
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  return (
  <SafeAreaView edges={['left','right','bottom']} style={[styles.screen, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Conteúdo principal */}
        <View style={styles.contentContainer}>
          {/* Missão */}
          <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]} testID="mission-section">
            <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontSize: fontSize.lg }]} testID="mission-title">Nossa Missão</Text>
            <Text style={[styles.sectionText, { color: theme.colors.text.primary, fontSize: fontSize.md }]} testID="mission-text">
              O EcoSrev é uma plataforma inovadora dedicada à reciclagem responsável
              de resíduos eletrônicos, transformando consciência ambiental em ação
              concreta e recompensas tangíveis.
            </Text>
          </View>

          {/* Origem do Projeto */}
          <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]} testID="origin-section">
            <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontSize: fontSize.lg }]} testID="origin-title">Origem do Projeto</Text>
            <Text style={[styles.sectionText, { color: theme.colors.text.primary, fontSize: fontSize.md }]} testID="origin-text">
              Desenvolvido como projeto integrador pelos estudantes da{' '}
              <Text
                style={{ fontWeight: 'bold', color: theme.colors.primary, fontSize: fontSize.md }}
                onPress={() => Linking.openURL('https://fatecvotorantim.cps.sp.gov.br/')}
                testID="fatec-link"
              >
                Fatec Votorantim
              </Text>
              , o EcoSrev nasceu do desejo de criar uma solução tecnológica para os
              desafios ambientais relacionados ao descarte de eletrônicos.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, {  }]}>
          <Text style={[styles.footerText, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>© 2025 EcosRev. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionText: {
    lineHeight: 22,
  },
  footer: {
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
  },
});

export default AboutScreen;
