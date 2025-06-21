// src/components/ResetPasswordForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import AuthForm from './AuthForm';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetPasswordForm() {
  const navigation = useNavigation();
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  // Check if the user needs to reset password (has a temporary password)
  useEffect(() => {
    const checkResetPasswordRequired = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          const userInfo = await api.get('/usuario/me', {
            headers: { 'access-token': token }
          });
          
          // If the user doesn't need to reset password, redirect to home
          if (!userInfo.data.resetPasswordToken) {
            navigation.navigate('Home');
          }
        } else {
          // No token, redirect to login
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error checking reset password status:', error);
        navigation.navigate('Login');
      }
    };

    checkResetPasswordRequired();
  }, []);

  const handleResetPassword = async (values) => {
    setIsLoading(true);
    setFeedback(null);
    
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        throw new Error('Não autorizado');
      }
      
      // Call API to reset password
      const response = await api.post('/usuario/reset-password', 
        { novaSenha: values.password },
        { headers: { 'access-token': token } }
      );
      
      setFeedback({
        type: 'success',
        message: 'Senha alterada com sucesso!'
      });
      
      // Navigate to home after successful reset
      setTimeout(() => {
        navigation.replace('Home');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      
      if (error.response && error.response.data) {
        setFeedback({
          type: 'error',
          message: error.response.data.msg || 'Erro ao redefinir senha.'
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Erro de conexão. Verifique sua internet e tente novamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordFields = [
    { 
      name: 'password', 
      label: 'Nova Senha', 
      secureTextEntry: true 
    },
    { 
      name: 'confirmPassword', 
      label: 'Confirmar Nova Senha', 
      secureTextEntry: true 
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>
        Redefinir Senha
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>
        Você está usando uma senha temporária. Por favor, crie uma nova senha para continuar.
      </Text>

      <AuthForm
        initialValues={{ password: '', confirmPassword: '' }}
        onSubmit={handleResetPassword}
        fields={resetPasswordFields}
        isPasswordVisible={false}
        togglePasswordVisibility={() => {}}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
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
    marginTop: 16,
  },
});