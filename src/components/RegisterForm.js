// src/components/RegisterForm.js
import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
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
      // montar endereco completo a partir dos campos separados
      const enderecoConstruido = `${values.logradouro || ''}${values.numero ? ', ' + values.numero : ''}${values.complemento ? ' - ' + values.complemento : ''}${values.bairro ? ' - ' + values.bairro : ''}${values.cidade ? ' - ' + values.cidade : ''}${values.estado ? ' - ' + values.estado : ''}${values.cep ? ' - CEP: ' + values.cep : ''}`;

      const response = await api.post('/usuario', {
        nome: values.name,
        email: values.email,
        senha: values.password,
        tipo: "Cliente",
        cpf: values.cpf || '',
        celular: values.celular || '',
        endereco: enderecoConstruido,
      });

      alert("Cadastro realizado com sucesso!");
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

  const [useExampleData, setUseExampleData] = useState(false);

  const exampleValues = {
    name: 'Maria Exemplo',
    cpf: '12345678901',
    celular: '5511999998888',
    email: 'maria.exemplo@example.com',
    password: 'Exemplo@123',
    logradouro: 'Rua das Flores',
    numero: '100',
    complemento: '',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001000'
  };

  const registerFields = [
    { name: 'name', label: 'Nome Completo' },
    { name: 'cpf', label: 'CPF', keyboardType: 'numeric' },
    { name: 'celular', label: 'Celular', keyboardType: 'phone-pad' },
    { name: 'email', label: 'Email' },
    { name: 'password', label: 'Senha', secureTextEntry: true },
    { name: 'logradouro', label: 'Logradouro' },
    { name: 'numero', label: 'Número', keyboardType: 'numeric' },
    { name: 'complemento', label: 'Complemento' },
    { name: 'bairro', label: 'Bairro' },
    { name: 'cidade', label: 'Cidade' },
    { name: 'estado', label: 'Estado' },
    { name: 'cep', label: 'CEP', keyboardType: 'numeric' },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
      <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>Cadastro</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Checkbox
          status={useExampleData ? 'checked' : 'unchecked'}
          onPress={() => setUseExampleData(!useExampleData)}
          color={theme.colors.primary}
        />
        <TouchableOpacity onPress={() => setUseExampleData(!useExampleData)}>
          <Text style={{ color: theme.colors.text.primary }}>{useExampleData ? 'Usando dados de exemplo' : 'Mostrar dados de exemplo'}</Text>
        </TouchableOpacity>
      </View>

      <AuthForm
        initialValues={useExampleData ? exampleValues : { name: '', cpf: '', celular: '', email: '', password: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }}
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

      {/* Removi o botão de voltar para Home, pois agora está dentro do modal de login */}
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