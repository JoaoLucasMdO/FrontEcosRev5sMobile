// src/components/RegisterForm.js
import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
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
      // Monta o payload com os campos que a rota /usuario valida
      const payload = {
        nome: values.name,
        email: values.email,
        senha: values.password,
        tipo: 'Cliente',
        cpf: values.cpf || '',
        celular: values.celular || '',
        // enviar endereço em campos separados para passar nas validações server-side
        logradouro: values.logradouro || '',
        numero: values.numero || '',
        complemento: values.complemento || '',
        bairro: values.bairro || '',
        cidade: values.cidade || '',
        estado: values.estado || '',
        cep: values.cep || '',
        ativo: true
      };

      const response = await api.post('/usuario', payload);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      onClose();
    } catch (error) {
      let msg = '';
      if (error.response) {
        // Erro retornado pelo servidor
        msg += `Status: ${error.response.status}\n`;
        if (error.response.data && error.response.data.errors) {
          msg += error.response.data.errors.map(e => e.msg).join("\n");
        } else if (error.response.data && error.response.data.message) {
          msg += error.response.data.message;
        } else {
          msg += JSON.stringify(error.response.data);
        }
      } else if (error.request) {
        // Sem resposta do servidor
        msg = 'Sem resposta do servidor. Verifique sua conexão ou se o backend está online.';
      } else if (error.message) {
        // Erro de configuração ou rede
        msg = `Erro: ${error.message}`;
      } else {
        msg = `Erro desconhecido: ${JSON.stringify(error)}`;
      }
      Alert.alert("Erro no cadastro", msg);
      console.error("Erro no cadastro:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const registerFields = [
    { name: 'name', label: 'Nome Completo', placeholder: 'Seu nome completo', autoCapitalize: 'words', maxLength: 100 },
    { name: 'cpf', label: 'CPF', keyboardType: 'numeric', mask: 'cpf', placeholder: '000.000.000-00', maxLength: 14 },
    { name: 'celular', label: 'Celular', keyboardType: 'phone-pad', placeholder: '+55 (xx) xxxxx-xxxx', maxLength: 15 },
    { name: 'email', label: 'Email', placeholder: 'seu@exemplo.com', autoCapitalize: 'none', maxLength: 120 },
    { name: 'password', label: 'Senha', secureTextEntry: true, placeholder: 'Senha (mín. 6 caracteres)', maxLength: 64 },
    { name: 'logradouro', label: 'Logradouro', placeholder: 'Rua, Avenida, etc.', maxLength: 200 },
    { name: 'numero', label: 'Número', keyboardType: 'numeric', placeholder: 'Número', maxLength: 10 },
    { name: 'complemento', label: 'Complemento', placeholder: 'Apartamento, bloco, etc.', maxLength: 50 },
    { name: 'bairro', label: 'Bairro', placeholder: 'Bairro', maxLength: 80 },
    { name: 'cidade', label: 'Cidade', placeholder: 'Cidade', maxLength: 100 },
    { name: 'estado', label: 'Estado', placeholder: 'SP', maxLength: 2, autoCapitalize: 'characters' },
    { name: 'cep', label: 'CEP', keyboardType: 'numeric', mask: 'cep', placeholder: '00000-000', maxLength: 9 },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
      <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>Cadastro</Text>


      <AuthForm
  initialValues={{ name: '', cpf: '', celular: '', email: '', password: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
        fields={registerFields}
        isPasswordVisible={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
      >
        {({ handleSubmit, values, setFieldValue }) => {
          const fetchAddressByCEP = async (cep) => {
            const clean = (cep || '').replace(/\D/g, '');
            if (clean.length !== 8) {
              Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos para buscar.');
              return;
            }
            try {
              const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
              const j = await resp.json();
              if (j.erro) throw new Error('CEP não encontrado');
              // popular campos
              setFieldValue('logradouro', j.logradouro || '');
              setFieldValue('bairro', j.bairro || '');
              setFieldValue('cidade', j.localidade || '');
              setFieldValue('estado', j.uf || '');
              Alert.alert('Endereço preenchido', 'Logradouro, bairro, cidade e estado preenchidos a partir do CEP.');
            } catch (error) {
              console.error('ViaCEP erro', error);
              Alert.alert('Erro', 'Não foi possível buscar o CEP.');
            }
          };

          return (
            <>
              {/* Botão buscar por CEP acima do botão cadastrar */}
              <View style={{ marginBottom: 10, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => fetchAddressByCEP(values.cep)} style={[styles.cepButton, { borderColor: theme.colors.primary }] }>
                  <Text style={{ color: theme.colors.primary }}>Buscar por CEP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>Cadastrar</Text>
              </TouchableOpacity>
            </>
          );
        }}
      </AuthForm>

      <TouchableOpacity onPress={onClose} style={styles.link}>
        <Text style={[styles.linkText, { color: theme.colors.primary, fontSize: fontSize.sm }]}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {},
  cepButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  }
});