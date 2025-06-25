// src/components/RegisterForm.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { registerSchema } from '../utils/validationSchemas';
import AuthForm from './AuthForm';
import api from '../services/api'; 

export default function RegisterForm({ onClose }) {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  const handleRegister = async (values) => {
    try {
      const response = await api.post('/usuario', {
        nome: values.name,
        email: values.email,
        senha: values.password,
        tipo: "Cliente",
      });

      const data = response.data;

      alert("Cadastro realizado com sucesso!");
      onClose(); 
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMsg = error.response.data.errors.map(e => e.msg).join("\n");
        alert(errorMsg);
      } else {
        alert("Erro na conexão com o servidor.", error);
      }
      console.error("Erro no cadastro:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const registerFields = [
    { name: 'name', label: 'Nome Completo' },
    { name: 'email', label: 'Email' },
    { name: 'password', label: 'Senha', secureTextEntry: true },
  ];

  return (
    <View>
      <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>Cadastro</Text>

      <AuthForm
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
        fields={registerFields}
        isPasswordVisible={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
      >
        {({ handleSubmit }) => (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>Cadastrar</Text>
          </TouchableOpacity>
        )}
      </AuthForm>

      <TouchableOpacity onPress={onClose} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.colors.primary, fontSize: fontSize.sm }]}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>

      {/* Removi o botão de voltar para Home, pois agora está dentro do modal de login */}
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
    marginTop: 16,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {},
});