import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "../components/Carousel";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { IconButton } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  const navigateToLogin = () => {
    if (isAuthenticated) {
      // Usuário já está logado, mostrar mensagem
      Alert.alert(
        "Você já está logado!",
        "Você já possui uma conta ativa no EcosRev. Explore as funcionalidades do app através do menu ou das abas na parte inferior.",
        [
          {
            text: "OK",
            style: "default"
          }
        ]
      );
    } else {
      // Usuário não está logado, navegar para tela de login
      navigation.navigate("Login");
    }
  };

  //Carousel de Imagens
  const carouselSlides = [
    {
      imageSrc: require("../../assets/imagem1.jpg"),
      altText: "Imagem 1",
    },
    {
      imageSrc: require("../../assets/backgroundImg.jpeg"),
      altText: "Imagem 2",
    },
    {
      imageSrc: require("../../assets/macawImg.jpeg"),
      altText: "Imagem 3",
    },
    {
      imageSrc: require("../../assets/toucanImg.jpeg"),
      altText: "Imagem 4",
    },
    {
      imageSrc: require("../../assets/beeImg.jpeg"),
      altText: "Imagem 5",
    },
    {
      imageSrc: require("../../assets/imagem3.jpg"),
      altText: "Imagem 6",
    },
  ];

  // Dados dos depoimentos
  const testimonials = [
    {
      id: 1,
      username: "@carlossantos",
      text: "Uma excelente iniciativa! Agora meus filhos entendem a importância de reciclar e ainda se divertem trocando pontos por prêmios.💚",
      rating: 5,
      avatarBgColor: "#25C36A",
      userInfo: "Usuário do EcosRev há 2 anos."
    },
    {
      id: 2,
      username: "@anasouza",
      text: "EcosRev é simplesmente incrível! Simplesmente adoro! O sistema de pontos é muito gratificante e o suporte ao cliente é fantástico.",
      rating: 5,
      avatarBgColor: "#F5B041",
      userInfo: "Usuário do EcosRev há 1 ano."
    },
    {
      id: 3,
      username: "@ambientalbsg_mariasilva",
      text: "O melhor app de reciclagem que já usei! Recomendo demais.",
      rating: 5,
      avatarBgColor: "#85C1E9",
      userInfo: "Usuário do EcosRev há 6 meses."
    }
  ];

  return (
    <SafeAreaView
      edges={['left','right','bottom']}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle={
          theme.colors.text.inverse === "#FFFFFF"
            ? "light-content"
            : "dark-content"
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Carousel slides={carouselSlides} />

        {/* Introdução */}
        <View
          style={[
            styles.introductionContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.primary, fontSize: fontSize.lg },
            ]}
          >
            Bem-vindo ao EcosRev
          </Text>
          <Text
            style={[
              styles.introText,
              { color: theme.colors.text.primary, fontSize: fontSize.md },
            ]}
          >
            Uma plataforma inovadora para reciclagem de resíduo eletrônico e
            troca de pontos por recompensas. Junte-se a nós e faça parte da
            mudança!
          </Text>

          {/* Botão: Começar Agora */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={navigateToLogin}
            activeOpacity={0.7}
            accessibilityLabel={isAuthenticated ? "Botão Explorar App. Você já está logado." : "Botão Começar Agora. Pressione para ir para a tela de login."}
          >
            <Text
              style={[
                styles.ctaButtonText,
                { color: theme.colors.text.inverse, fontSize: fontSize.md },
              ]}
            >
              {isAuthenticated ? "Explorar App" : "Começar Agora"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Serviços */}
        <View
          style={[
            styles.servicesContainer,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text.inverse, fontSize: fontSize.xxl },
            ]}
          >
            O que oferecemos
          </Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceItem}>
              <MaterialIcons
                name="recycling"
                size={60}
                color="#fff"
                accessibilityLabel="Ícone de reciclagem de eletrônicos"
              />
              <Text
                style={[
                  styles.serviceTitle,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Reciclagem de Eletrônicos
              </Text>
              <Text
                style={[
                  styles.serviceText,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Recicle seus aparelhos eletrônicos de forma segura e
                responsável.
              </Text>
            </View>

            <View style={styles.serviceItem}>
              <FontAwesome6
                name="coins"
                size={60}
                color="#fff"
              />
              <Text
                style={[
                  styles.serviceTitle,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Acúmulo de Pontos
              </Text>
              <Text
                style={[
                  styles.serviceText,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Ganhe pontos a cada item reciclado e troque por prêmios.
              </Text>
            </View>

            <View style={styles.serviceItem}>
              <IconButton
                icon="gift"
                size={60}
                iconColor="#fff"
                style={{ margin: 0 }}
              />
              <Text
                style={[
                  styles.serviceTitle,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Recompensas Exclusivas
              </Text>
              <Text
                style={[
                  styles.serviceText,
                  { color: theme.colors.text.inverse, fontSize: fontSize.md },
                ]}
              >
                Troque seus pontos por descontos, produtos, serviços e muito
                mais.
              </Text>
            </View>
          </View>
        </View>

        {/* Depoimentos */}
        <View style={[styles.testimonialsContainer, { backgroundColor: theme.colors.surface }]}>
          
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.primary, fontSize: fontSize.lg, fontWeight: "bold" },
            ]}
          >
            Depoimentos
          </Text>
          
          <View style={styles.testimonialsGrid}>
            {testimonials.map((item) => (
              <View key={item.id} style={[styles.testimonialCard, { backgroundColor: theme.colors.surface }]}>
                {/* Estrelas de avaliação */}
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <IconButton
                      key={index}
                      icon="star"
                      size={24}
                      iconColor="#FFE136"
                      style={{ margin: 0 }}
                    />
                  ))}
                </View>
                
                <Text
                  style={[
                    styles.testimonialText,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {item.text}
                </Text>
                
                <View style={styles.userInfoContainer}>
                  <View style={[styles.avatarContainer, { backgroundColor: item.avatarBgColor }]}>
                    <MaterialIcons name="person" size={32} color="#fff" />
                  </View>
                  
                  <View style={styles.userDetailsContainer}>
                    <Text
                      style={[
                        styles.usernameText,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {item.username}
                    </Text>
                    <Text
                      style={[
                        styles.userInfoText,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {item.userInfo}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  introductionContainer: {
    padding: 20,
    alignItems: "center",
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
  },
  ctaButtonText: {
    fontWeight: "bold",
  },
  servicesContainer: {
    padding: 20,
    alignItems: "center",
  },
  testimonialsContainer: {
    padding: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  introText: {
    textAlign: "center",
    lineHeight: 24,
  },
  servicesGrid: {
    width: "100%",
  },
  serviceItem: {
    alignItems: "center",
    marginBottom: 30,
  },
  serviceTitle: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  serviceText: {
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 10,
  },
  testimonialsGrid: {
    width: "100%",
    alignItems: "center",
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
    maxWidth: 450,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  testimonialText: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
  },
  avatarImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
  },
  userDetailsContainer: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userInfoText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    padding: 15,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
  },
});