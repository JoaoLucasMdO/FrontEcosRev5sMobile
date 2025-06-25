// src\screens\ResetPasswordScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { resetPasswordSchema } from '../utils/validationSchemas';
import AuthForm from '../components/AuthForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ResetPasswordScreen() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [userName, setUserName] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Adicionando estado para visibilidade da senha
    const theme = useTheme();
    const { fontSize } = useFontSettings();

    // Função para alternar a visibilidade da senha
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    // Get user info when component mounts
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    // User is not logged in, redirect to login
                    navigatio.navigate('Login');
                    return;
                }

                // Get user data
                const response = await api.get('/usuario/me', {
                    headers: { 'access-token': token }
                });
                console.log("a " + response.data)
                // If user doesn't have resetPasswordToken, they shouldn't be on this screen
                if (!response.data.resetPasswordToken) {
                    navigation.navigate('Main', { screen: 'HomeTab' });
                    return;
                }

                // Set user name for display
                setUserName(response.data.nome || '');
            } catch (error) {
                console.error('Error getting user info:', error);
                // If error, redirect to login
                await AsyncStorage.removeItem('token');
                navigation.navigate('Login');
            }
        };

        getUserInfo();
    }, [navigation]);

    const handleResetPassword = async (values) => {
        setIsLoading(true);
        setFeedback(null);

        try {
            // Get authentication token
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token de autenticação não encontrado');
            }

            // Call API to reset password
            await api.post('/usuario/reset-password', 
                { novaSenha: values.password },
                { headers: { 'access-token': token } }
            );
            
            // Show success feedback
            setFeedback({
                type: 'success',
                message: 'Senha alterada com sucesso!'
            });
            
            // Navigate to home after successful reset
            setTimeout(() => {
                navigation.navigate('Main', { screen: 'HomeTab' });
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            
            // Handle error feedback
            if (error.response?.data?.msg) {
                setFeedback({
                    type: 'error',
                    message: error.response.data.msg
                });
            } else if (error.response?.data?.errors) {
                const errorMsg = error.response.data.errors.map(err => err.msg).join('\n');
                setFeedback({
                    type: 'error',
                    message: errorMsg
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: 'Erro ao redefinir senha. Tente novamente.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const passwordFields = [
        {
            name: 'password',
            label: 'Nova Senha',
            secureTextEntry: true,
            placeholder: 'Informe sua nova senha',
        },
        {
            name: 'confirmPassword',
            label: 'Confirmar Senha',
            secureTextEntry: true,
            placeholder: 'Confirme sua nova senha',
        },
    ];

    return (
        <ScrollView 
            contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>
                Redefinir Senha
            </Text>
            
            {userName && (
                <Text style={[styles.welcomeText, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>
                    Olá, {userName}
                </Text>
            )}
            
            <Text style={[styles.instructionText, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>
                Você está usando uma senha temporária. Por favor, crie uma nova senha para continuar usando o aplicativo.
            </Text>
            
            <View style={styles.formContainer}>
                <AuthForm
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={resetPasswordSchema}
                    onSubmit={handleResetPassword}
                    fields={passwordFields}
                    isPasswordVisible={isPasswordVisible}
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
                                    Salvar Nova Senha
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </AuthForm>
            </View>
            
            {feedback && (
                <Text 
                    style={[
                        styles.feedbackText, 
                        { 
                            color: feedback.type === 'success' ? theme.colors.success : theme.colors.error,
                            fontSize: fontSize.sm 
                        }
                    ]}
                >
                    {feedback.message}
                </Text>
            )}
            
            <View style={styles.securityTipsContainer}>
                <Text style={[styles.securityTipsTitle, { color: theme.colors.text.primary, fontSize: fontSize.sm, fontWeight: 'bold' }]}>
                    Dicas de segurança:
                </Text>
                <Text style={[styles.securityTipsText, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>
                    • Use pelo menos 6 caracteres{'\n'}
                    • Inclua pelo menos uma letra maiúscula{'\n'}
                    • Inclua pelo menos uma letra minúscula{'\n'}
                    • Inclua pelo menos um número{'\n'}
                    • Inclua pelo menos um caractere especial (ex: !@#$%^&*)
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    welcomeText: {
        textAlign: 'center',
        marginBottom: 10,
    },
    instructionText: {
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    feedbackText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    securityTipsContainer: {
        marginTop: 30,
        padding: 15,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    securityTipsTitle: {
        marginBottom: 10,
    },
    securityTipsText: {
        lineHeight: 20,
    }
});