// src/components/ForgotPasswordForm.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { forgotPasswordSchema } from '../utils/validationSchemas';
import AuthForm from './AuthForm';
import api from '../services/api'; // Make sure you have this file for API calls

export default function ForgotPasswordForm({ onClose }) {
  const navigation = useNavigation();
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  const handleResetPassword = async (values) => {
    setIsLoading(true);
    setFeedback(null);
    
    try {
      // Call the API endpoint we created in the backend
      const response = await api.post('/usuario/forgot-password', {
        email: values.email
      });
      
      // Success message
      setFeedback({
        type: 'success',
        message: response.data.message || 'Uma senha temporária foi enviada para seu email.'
      });
      
      // In a real app, you might want to navigate or close the modal after a delay
      // setTimeout(() => onClose(), 3000);
      
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The server responded with an error status
        if (error.response.status === 404) {
          setFeedback({
            type: 'error',
            message: 'Email não encontrado no sistema.'
          });
        } else if (error.response.data && error.response.data.errors) {
          // Get the first error message from the validation errors
          setFeedback({
            type: 'error',
            message: error.response.data.errors[0].msg
          });
        } else {
          setFeedback({
            type: 'error',
            message: 'Erro ao processar sua solicitação. Tente novamente.'
          });
        }
      } else {
        // Network error or other issue
        setFeedback({
          type: 'error',
          message: 'Erro de conexão. Verifique sua internet e tente novamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPasswordFields = [
    { name: 'email', label: 'Email', autoCapitalize: 'none', keyboardType: 'email-address' },
  ];

  return (
    <View>
      <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>
        Recuperar Senha
      </Text>

      <AuthForm
        initialValues={{ email: '' }}
        validationSchema={forgotPasswordSchema}
        onSubmit={handleResetPassword}
        fields={forgotPasswordFields}
        isPasswordVisible={false}
        togglePasswordVisibility={() => {}}
        errorMessages={feedback && feedback.type === 'error' ? { email: feedback.message } : null}
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
                Enviar
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

      <TouchableOpacity onPress={onClose} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.colors.primary, fontSize: fontSize.sm }]}>
          Voltar para o login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {},
  feedbackText: {
    textAlign: 'center',
    marginTop: 16,
  },
});