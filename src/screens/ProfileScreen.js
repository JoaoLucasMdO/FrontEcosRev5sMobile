import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { IconButton } from 'react-native-paper';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import CustomAlert from '../components/CustomAlert';
import PasswordModal from '../components/PasswordModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';


export default function ProfileScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { fontSize } = useFontSettings(); const [userData, setUserData] = useState({
    _id: '',
    nome: '',
    email: '',
    profileImage: '',
    pontos: 0,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Estados para os CustomAlerts
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
    onCancel: () => { },
    confirmColor: '',
    showCancelButton: true,
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      fetchUserPoints();
    }, [])
  );

  const fetchUserPoints = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`/usuario/pontos`, {
        headers: { "access-token": token }
      });

      if (response.data && response.data.length > 0) {
        setUserData(prevData => ({
          ...prevData,
          pontos: response.data[0].pontos
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar pontos do usuário:", error);
    }
  };
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuario/me`, {
        headers: {
          'Content-Type': 'application/json',
          'access-token': await AsyncStorage.getItem('token')
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      const data = await response.json();
      const user = Array.isArray(data.results) ? data.results[0] : data; // adapte se a estrutura do retorno for diferente

      setUserData(prevData => ({
        ...prevData,
        _id: user._id,
        nome: user.nome,
        email: user.email,
        profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg',
      }));
    } catch (error) {
      console.error('Erro ao obter os dados do usuário:', error);
      setUserData({
        _id: "",
        nome: "",
        email: "",
        profileImage: "",
        pontos: 0,
      });
      showAlert({
        title: 'Erro',
        message: 'Não foi possível carregar os dados do perfil.',
        confirmText: 'OK',
        confirmColor: theme.colors.error,
        showCancelButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função genérica para mostrar alertas, com controle de botão único e callback de cancelamento
  const showAlert = ({
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    onConfirm = () => { },
    onCancel = () => { },
    confirmColor = theme.colors.primary,
    showCancelButton = true
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmColor,
      showCancelButton,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        onConfirm();
      }, onCancel: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      }
    });
  };

  const handleLogout = () => {
    showAlert({
      title: 'Confirmar Saída',
      message: 'Tem certeza que deseja sair da conta?',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      confirmColor: theme.colors.error,
      showCancelButton: true,
      onConfirm: async () => {
        try {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.navigate('Login');
        } catch (error) {
          console.error('Erro ao remover token:', error);
        }
      },
    });
  };

  const handleDeleteAccount = async () => {
    // Verifica se o usuário tem pontos
    if (userData.pontos > 0) {
      showAlert({
        title: 'Atenção',
        message: `Você ainda possui ${userData.pontos} pontos. Deseja trocar seus pontos por benefícios antes de apagar sua conta?`,
        confirmText: 'Trocar Pontos',
        cancelText: 'Apagar Mesmo Assim',
        confirmColor: theme.colors.primary,
        showCancelButton: true,
        onConfirm: () => {
          // Navega para a tela de benefícios para trocar os pontos
          navigation.navigate('Main', { screen: 'BenefitsTab' });
        },
        onCancel: () => {
          // Prossegue com a exclusão mesmo tendo pontos
          confirmDeleteAccount();
        }
      });
    } else {
      // Se não tem pontos, apenas pergunta se tem certeza
      confirmDeleteAccount();
    }
  };

  const confirmDeleteAccount = () => {
    showAlert({
      title: 'Apagar Conta',
      message: 'Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.',
      confirmText: 'Apagar',
      cancelText: 'Cancelar',
      confirmColor: theme.colors.error,
      showCancelButton: true,
      onConfirm: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;

          // Obtem o ID do usuário do token
          const userId = userData._id;

          // Faz a requisição DELETE para apagar a conta
          await api.delete(`/usuario/${userId}`, {
            headers: { "access-token": token }
          });

          // Remove o token e navega para a tela de login
          await AsyncStorage.removeItem('token');
          showAlert({
            title: 'Sucesso',
            message: 'Sua conta foi apagada com sucesso.',
            confirmText: 'OK',
            confirmColor: theme.colors.success || theme.colors.primary,
            showCancelButton: false,
            onConfirm: () => {
              navigation.navigate('Login');
            }
          });
        } catch (error) {
          console.error('Erro ao apagar conta:', error);
          showAlert({
            title: 'Erro',
            message: 'Não foi possível apagar sua conta. Tente novamente mais tarde.',
            confirmText: 'OK',
            confirmColor: theme.colors.error,
            showCancelButton: false
          });
        }
      }
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <View style={styles.header}>
            {isLoading ? (
              <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.border }]} />
            ) : userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.userImage} />
            ) : (
              <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                <FontAwesome6 name="user" size={60} color={theme.colors.text.inverse} />
              </View>
            )}
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.lg }]}>
              Perfil do Usuário
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>
              Nome
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary,
                  fontSize: fontSize.md,
                  backgroundColor: theme.colors.background
                }
              ]}
              value={userData.nome}
              placeholder="Nome"
              placeholderTextColor={theme.colors.text.secondary}
              editable={false}
              onChangeText={(text) => setUserData({ ...userData, nome: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>
              E-mail
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary,
                  fontSize: fontSize.md,
                  backgroundColor: theme.colors.background
                }
              ]}
              value={userData.email}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.text.secondary}
              editable={false}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.passwordContainer, { backgroundColor: theme.colors.cardAlt || theme.colors.surface }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowPasswordModal(true)}
            >
              <IconButton icon="key" size={24} iconColor={theme.colors.text.inverse} style={{ margin: 0 }} />
              <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                Alterar Senha
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <IconButton icon="power" size={24} iconColor={theme.colors.error} style={{ margin: 0 }} />
          <Text style={[styles.logoutText, { color: theme.colors.error, fontSize: fontSize.md }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* Link apagar conta */}
        <TouchableOpacity
          style={styles.deleteAccountLink}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.deleteAccountLinkText, { color: theme.colors.text.secondary, fontSize: fontSize.sm || fontSize.md - 2 }]}>
            Apagar minha conta
          </Text>
        </TouchableOpacity>
      </View>

      <PasswordModal
        isVisible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={() => {
          // Lógica para salvar a senha (você pode passar uma função aqui)
          showAlert({
            title: 'Sucesso',
            message: 'Senha alterada com sucesso.',
            confirmColor: theme.colors.success,
            showCancelButton: false,
          });
          setShowPasswordModal(false);
        }}
        theme={theme}
        fontSize={fontSize}
        showAlert={showAlert}
      />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmColor={alertConfig.confirmColor}
        showCancelButton={alertConfig.showCancelButton}
        singleButtonText={alertConfig.confirmText || "OK"}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  passwordContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 2,
  }, logoutText: {
    marginLeft: 10,
    fontWeight: 'bold',
  }, deleteAccountLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  deleteAccountLinkText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
    opacity: 0.8,
  },
});
