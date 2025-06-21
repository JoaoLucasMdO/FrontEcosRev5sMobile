// Modificação para LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../assets/logo.svg';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { loginSchema } from '../utils/validationSchemas';
import AuthForm from '../components/AuthForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import api from '../services/api';



export default function LoginScreen() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const theme = useTheme();
    const { fontSize } = useFontSettings();
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    const handleLogin = async (values) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Login request
            const response = await api.post('/usuario/login', {
                email: values.email,
                senha: values.password,
            });

            const { access_token, redirect_url } = response.data;

            // Store the token
            await AsyncStorage.setItem('token', access_token);
            

            // Now check if the user needs to reset their password
            const userInfoResponse = await api.get('/usuario/me', {
                headers: { 'access-token': access_token }
            });
            await AsyncStorage.setItem('user', userInfoResponse.data._id)
            // Se o usuário tem uma senha temporária (token de redefinição), redirecionar para a tela de redefinição de senha
            if (userInfoResponse.data.resetPasswordToken) {
                // Mostrar uma mensagem breve de sucesso
                alert('Login com senha temporária. Você precisa criar uma nova senha.');

                // Armazenar informações necessárias para a tela de redefinição de senha
                await AsyncStorage.setItem('user_email', values.email);

                // MODIFICAÇÃO AQUI: Usar o método de navegação correto
                // Para navegadores aninhados, precisamos usar um método diferente
                navigation.navigate('Main', { screen: 'ResetTab' });
            } else {
                // Fluxo normal de login - navegar para a tela apropriada com base no tipo de usuário
                alert('Login realizado com sucesso!');


                // Navegação para home
                navigation.navigate('Main', { screen: 'HomeTab' });
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response?.data?.errors) {
                const mensagens = error.response.data.errors.map(err => err.msg).join('\n');
                setErrorMessage(mensagens);
                alert(`Erro no login:\n${mensagens}`);
            } else {
                setErrorMessage('Erro de conexão com o servidor.');
                alert('Erro de conexão com o servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginFields = [
        {
            name: 'email',
            label: 'Email',
            placeholder: 'Insira seu email',
            autoCapitalize: 'none',
            keyboardType: 'email-address'
        },
        {
            name: 'password',
            label: 'Senha',
            placeholder: 'Insira sua senha',
            secureTextEntry: !showPassword
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                {errorMessage && (
                <Text style={[styles.errorMessage, { color: theme.colors.error, fontSize: fontSize.sm }]}>
                    {errorMessage}
                </Text>
                )}

                <AuthForm
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={handleLogin}
                    fields={loginFields}
                    isPasswordVisible={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                >
                    {({ handleSubmit }) => (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.text.inverse} />
                            ) : (
                                <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </AuthForm>

                {/* Links agora alinhados à esquerda */}
                <TouchableOpacity
                    onPress={() => setIsForgotPasswordModalVisible(true)}
                    style={styles.forgotPasswordLink}
                >
                    <Text style={[styles.forgotPasswordText, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>
                        Esqueceu a senha?
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setIsRegisterModalVisible(true)}
                    style={styles.link}
                >
                    <Text style={[styles.linkText, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>
                        Não possui uma conta?
                    </Text>
                </TouchableOpacity>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Logo width={209} height={98} />
                </View>
                
                {/* Botão de voltar */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
                    style={styles.backHomeButton}
                >
                    <Ionicons name="arrow-back" size={18} color={theme.colors.text.primary} />
                    <Text style={[styles.backHomeText, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>
                        Voltar para tela inicial
                    </Text>
                </TouchableOpacity>

                {/* Modal para o formulário de Cadastro */}
                <Modal
                    visible={isRegisterModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsRegisterModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setIsRegisterModalVisible(false)}>
                                    <Text style={{ color: theme.colors.primary, fontSize: fontSize.md }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <RegisterForm onClose={() => setIsRegisterModalVisible(false)} />
                        </View>
                    </View>
                </Modal>

                {/* Modal para o formulário de Recuperação de Senha */}
                <Modal
                    visible={isForgotPasswordModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsForgotPasswordModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setIsForgotPasswordModalVisible(false)}>
                                    <Text style={{ color: theme.colors.primary, fontSize: fontSize.md }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <ForgotPasswordForm onClose={() => setIsForgotPasswordModalVisible(false)} />
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 8,
    padding: 24,
    width: '90%',
    maxWidth: 350, 
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'red',
    fontSize: 14,
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
  button: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    height: 40,
  },
  link: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  forgotPasswordLink: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  forgotPasswordText: {
    textDecorationLine: 'underline'
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  logo: {
    height: 98,
    width: 209,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  modalCloseButton: {
    fontSize: 20,
    color: '#555',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});