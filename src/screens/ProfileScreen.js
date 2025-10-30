import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert, Animated, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { useAuth } from '../contexts/AuthContext';
import { IconButton } from 'react-native-paper';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomAlert from '../components/CustomAlert';
import PasswordModal from '../components/PasswordModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';


export default function ProfileScreen() {
  const navigation = useNavigation();
   const { logout } = useAuth();
  const theme = useTheme();
  const { fontSize } = useFontSettings(); const [userData, setUserData] = useState({
    _id: '',
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    endereco: '',
    profileImage: '',
    pontos: 0,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editModal, setEditModal] = useState({ visible: false, field: '', value: '' });
  const [addressForm, setAddressForm] = useState({ logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' });
  const [bioEditing, setBioEditing] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalAnim] = useState(new Animated.Value(0));
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

      if (response.data && response.data.pontos !== undefined) {
        setUserData(prevData => ({
          ...prevData,
          pontos: response.data.pontos
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar pontos do usuário:", error);
    }
  };


  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // sem token: usuário não autenticado — limpa estado e informa ao usuário
        setUserData({
          _id: '',
          nome: '',
          email: '',
          cpf: '',
          celular: '',
          endereco: '',
          profileImage: '',
          pontos: 0,
          bio: ''
        });
        setIsLoading(false);
        showAlert({
          title: 'Não autenticado',
          message: 'Faça login para acessar o perfil.',
          confirmText: 'OK',
          showCancelButton: false,
        });
        return;
      }

      const response = await api.get(`/usuario/me`, {
        headers: {
          'Content-Type': 'application/json',
          'access-token': token
        },
      });

        const data = response.data;
          const user = Array.isArray(data.results) ? data.results : data;

          // Monta o endereço completo a partir dos campos separados, se existirem
          const formatFullAddress = (u) => {
            if (!u) return '';
            // se já existe um campo 'endereco' stringify, usa ele
            if (u.endereco && String(u.endereco).trim() !== '') return String(u.endereco);
            // caso o backend retorne campos separados, monta uma string legível
            const logradouro = u.logradouro || '';
            const numero = u.numero || '';
            const complemento = u.complemento || '';
            const bairro = u.bairro || '';
            const cidade = u.cidade || '';
            const estado = u.estado || '';
            const cep = u.cep || '';
            const parts = [];
            if (logradouro) parts.push(numero ? `${logradouro}, ${numero}` : logradouro);
            if (complemento) parts.push(complemento);
            if (bairro) parts.push(bairro);
            const cityState = [cidade, estado].filter(Boolean).join(' - ');
            if (cityState) parts.push(cityState);
            if (cep) parts.push(`CEP: ${cep}`);
            const constructed = parts.join(' - ');
            // se não temos nada montado, pode haver um campo 'localizacao'
            if (!constructed && u.localizacao) return String(u.localizacao);
            return constructed;
          };

          const fullAddress = formatFullAddress(user);

          let profileImageUrl = user.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg';
          try {
            const userId = user.id;
            if (userId && token) {
              const avatarResp = await api.get(`/usuario/avatar/${userId}`, { headers: { 'access-token': token } });
              if (avatarResp.data && avatarResp.data.url) {
                profileImageUrl = avatarResp.data.url;
              }
            }
          } catch (err) {
            
          }
          setUserData(prevData => ({
            ...prevData,
            _id: user.id,
            nome: user.nome || user.fullName || '',
            email: user.email || '',
            cpf: user.cpf || '',
            celular: user.celular || user.telefone || '',
            endereco: fullAddress || '',
            profileImage: profileImageUrl,
          }));
    } catch (error) {
      console.error('Erro ao obter os dados do usuário:', error);
      // Em caso de erro real, limpa estado e informa o usuário
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
      // finalizar carregamento (retirei o uso do AsyncStorage para imagem por persistência indesejada)
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

  // Máscaras e utilitários simples
  const formatCPF = (cpf = '') => {
    const digits = (cpf + '').replace(/\D/g, '').slice(0, 11);
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, (m, a, b, c, d) => `${a}.${b}.${c}-${d}`) || digits.replace(/(\d{3})(\d{3})(\d{3})/, (m, a, b, c) => `${a}.${b}.${c}`) || digits;
  };

  const formatPhone = (phone = '') => {
    const digits = (phone + '').replace(/\D/g, '').slice(0, 13);
    // formato aproximado brasileiro: +55 XX XXXXX-XXXX ou (XX) XXXXX-XXXX
    if (digits.startsWith('55') && digits.length > 2) {
      const withoutDDI = digits.slice(2);
      if (withoutDDI.length <= 2) return `+55 ${withoutDDI}`;
      if (withoutDDI.length <= 6) return `+55 (${withoutDDI.slice(0, 2)}) ${withoutDDI.slice(2)}`;
      if (withoutDDI.length <= 10) return `+55 (${withoutDDI.slice(0, 2)}) ${withoutDDI.slice(2, 7)}-${withoutDDI.slice(7)}`;
    }
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return digits;
  };

  const unformat = (value = '') => (value + '').replace(/\D/g, '');

  // Validações simples
  const validateEmail = (email = '') => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone = '') => {
    const d = unformat(phone);
    return d.length >= 10 && d.length <= 13; // aceita DDD + 8-9 dígitos, opcional +55
  };
  const validateCEP = (cep = '') => {
    const d = (cep + '').replace(/\D/g, '');
    return d.length === 8;
  };

  // Heurística simples para decompor um endereco livre em campos
  const parseAddress = (endereco = '') => {
    // tenta dividir por separadores comuns: ',' ou ' - '
    if (!endereco) return { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' };
    // Remove 'CEP:' se existir
    const cepMatch = endereco.match(/CEP[:]?\s*(\d{5}-?\d{3})/i);
    const cep = cepMatch ? cepMatch[1].replace(/\D/g, '') : '';
    let main = endereco.replace(/CEP[:]?\s*(\d{5}-?\d{3})/i, '');
    // separar por ' - ' preferencialmente
    const parts = main.split(' - ').map(p => p.trim()).filter(Boolean);
    let logradouro = parts[0] || '';
    let numero = '';
    // se logradouro contem virgula, tenta separar numero
    if (logradouro && logradouro.includes(',')) {
      const [l, n, ...rest] = logradouro.split(',').map(s => s.trim());
      logradouro = l || '';
      numero = n || '';
      if (rest.length) parts.splice(0, 1, rest.join(' '));
    }
    const complemento = parts[1] || '';
    const bairro = parts[2] || '';
    const cidade = parts[3] || '';
    const estado = parts[4] || '';
    return { logradouro, numero, complemento, bairro, cidade, estado, cep };
  };

  const openEditModal = (field) => {
    if (field === 'endereco') {
      // tentar decompor endereco existente
      const parsed = parseAddress(userData.endereco || '');
      setAddressForm(parsed);
      setEditModal({ visible: true, field, value: userData.endereco || '' });
      setBioEditing(userData.bio || '');
    } else if (field === 'bio') {
      setBioEditing(userData.bio || '');
      setEditModal({ visible: true, field, value: userData.bio || '' });
    } else {
      setEditModal({ visible: true, field, value: userData[field] || '' });
    }
    // iniciar animação de entrada do modal
    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 40 }).start();
  };

  const changeProfilePhoto = () => {
    pickImage();
  };

  const removeProfileImage = () => {
    showAlert({
      title: 'Remover Foto',
      message: 'Tem certeza que deseja remover sua foto de perfil? Esta ação irá restaurar a imagem padrão.',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      confirmColor: theme.colors.error,
      showCancelButton: true,
      onConfirm: async () => {
        try {
          // apenas atualiza estado local (não usamos mais AsyncStorage para imagens)
          setUserData(prev => ({ ...prev, profileImage: '' }));
          // tentar sincronizar com backend
          const token = await AsyncStorage.getItem('token');
          if (token) {
            const userId = userData._id;
            const url = userId ? `/usuario/${userId}` : `/usuario/me`;
            try {
              await api.put(url, { profileImage: '' }, { headers: { 'access-token': token } });
            } catch (err) {
              console.warn('Não foi possível sincronizar a remoção da imagem com o backend:', err);
            }
          }
          showAlert({ title: 'Sucesso', message: 'Foto removida.', confirmText: 'OK', showCancelButton: false });
        } catch (err) {
          console.error('Erro ao remover foto de perfil:', err);
          showAlert({ title: 'Erro', message: 'Não foi possível remover a foto. Tente novamente.', confirmColor: theme.colors.error, showCancelButton: false });
        }
      }
    });
  };

  // animação para esconder modal quando fechar
  useEffect(() => {
    if (!editModal.visible) {
      Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [editModal.visible]);

const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ 
        title: 'Permissão', 
        message: 'Permissão para acessar fotos negada.', 
        confirmColor: theme.colors.error, 
        showCancelButton: false 
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    // Compatibilidade com novas versões do expo-image-picker (assets array)
    const uri = result.assets && result.assets[0] ? result.assets[0].uri : result.uri;
    
    if (!result.canceled && uri) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          showAlert({ 
            title: 'Erro', 
            message: 'Você precisa estar logado para atualizar a foto de perfil.', 
            confirmColor: theme.colors.error, 
            showCancelButton: false 
          });
          return;
        }

        // Criar um objeto FormData para enviar a imagem
        const formData = new FormData();

        // Criar objeto que representa o arquivo
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const file = {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          type: `image/${fileType}`,
          name: `profile-${Date.now()}.${fileType}`,
        };

        // Append da imagem com o nome do campo correto: 'image'
        formData.append('image', file);

        console.log('Enviando arquivo:', file);

        // Enviar a imagem para o servidor
        const uploadResponse = await api.post('/upload/image', formData, {
          headers: {
            'access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Resposta do upload:', uploadResponse.data);

        // Se o upload foi bem-sucedido e retornou um ID
        if (uploadResponse.data && uploadResponse.data.id) {
          const imageId = uploadResponse.data.id;
          const imageUrl = uploadResponse.data.url;
          
          console.log('Upload bem-sucedido. ID:', imageId, 'URL:', imageUrl);

          let profileImageUrl = imageUrl; 
          
          try {
            const userId = userData._id;
            if (userId) {
              const avatarResp = await api.get(`/usuario/${userId}/avatar`, {
                headers: { 'access-token': token }
              });
              
              if (avatarResp.data && avatarResp.data.url) {
                profileImageUrl = avatarResp.data.url;
                console.log('URL do avatar obtida:', profileImageUrl);
              }
            }
          } catch (err) {
            console.warn('Não foi possível obter a imagem de perfil via /avatar, usando URL do upload:', err);
          }
          
          // Tenta persistir o ID da imagem no perfil do usuário no backend
          try {
            const userId = userData._id;
            const url = userId ? `/usuario/${userId}` : `/usuario/me`;
            // Atualiza apenas se temos token e userId
            if (token && (userId || token)) {
              try {
                await api.put(url, { imagemPerfilId: imageId }, { headers: { 'access-token': token } });
                console.log('imagemPerfilId atualizado no backend com sucesso');
              } catch (err) {
                console.warn('Falha ao atualizar profileImage no backend (não crítico):', err);
              }
            }
          } catch (err) {
            console.warn('Erro ao tentar persistir profileImage no backend:', err);
          }

          // Atualiza o estado local
          setUserData(prev => ({ ...prev, profileImage: profileImageUrl }));
          
          showAlert({ 
            title: 'Sucesso', 
            message: 'Foto de perfil atualizada com sucesso!', 
            confirmColor: theme.colors.success || theme.colors.primary, 
            showCancelButton: false 
          });
        } else {
          console.warn('Upload concluído mas resposta inesperada:', uploadResponse.data);
          showAlert({ 
            title: 'Aviso', 
            message: 'Upload concluído, mas não foi possível obter a URL da imagem.', 
            confirmColor: theme.colors.warning, 
            showCancelButton: false 
          });
        }
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        console.error('Detalhes do erro:', error.response?.data);
        
        showAlert({ 
          title: 'Erro', 
          message: `Não foi possível fazer o upload da imagem. ${error.response?.data?.error || error.message}`, 
          confirmColor: theme.colors.error, 
          showCancelButton: false 
        });
      }
    }
  } catch (error) {
    console.error('Erro ao selecionar imagem:', error);
    showAlert({ 
      title: 'Erro', 
      message: 'Não foi possível selecionar a imagem.', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
  }
};

  const closeEditModal = () => setEditModal({ visible: false, field: '', value: '' });

  const handleSaveField = async () => {
  const { field, value } = editModal;
  if (!field) return;
  
  // Prepara payload
  let payload = {};
  
  if (field === 'celular') {
    payload.celular = unformat(value);
  } else if (field === 'nome') {
    payload.nome = value.trim();
  }
  
  // Validações
  
  if (field === 'celular') {
    const phoneDigits = unformat(value);
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      showAlert({ 
        title: 'Celular inválido', 
        message: 'Por favor informe um número de celular válido (10-11 dígitos).', 
        confirmColor: theme.colors.error, 
        showCancelButton: false 
      });
      return;
    }
  }
  
  if (field === 'nome' && (!value || value.trim().length < 3)) {
    showAlert({ 
      title: 'Nome inválido', 
      message: 'O nome deve ter pelo menos 3 caracteres.', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
    return;
  }
  
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showAlert({ 
        title: 'Erro', 
        message: 'Você precisa estar autenticado.', 
        confirmColor: theme.colors.error, 
        showCancelButton: false 
      });
      return;
    }

    console.log('Enviando dados para atualização:', payload);

    // USA SEMPRE /usuario/me para usuário autenticado
    const response = await api.put('/usuario/me', payload, {
      headers: { 
        'access-token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta da atualização:', response.data);

    // Atualiza o estado local
    setUserData(prev => ({ ...prev, ...payload }));
    
    showAlert({ 
      title: 'Sucesso', 
      message: 'Dados atualizados com sucesso.', 
      confirmColor: theme.colors.success || theme.colors.primary, 
      showCancelButton: false 
    });
    
    closeEditModal();
    
    // Recarrega os dados para garantir sincronização
    await fetchUserData();
    
  } catch (error) {
    console.error('Erro ao salvar campo:', error);
    console.error('Detalhes do erro:', error.response?.data);
    
    const errorMessage = error.response?.data?.errors?.[0]?.msg 
      || error.response?.data?.message 
      || 'Não foi possível salvar. Tente novamente.';
    
    showAlert({ 
      title: 'Erro', 
      message: errorMessage, 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
  }
};

  const handleSaveAddress = async () => {
  const { logradouro, numero, complemento, bairro, cidade, estado, cep } = addressForm;
  
  // Validações básicas
  if (!logradouro || logradouro.trim().length < 3) {
    showAlert({ 
      title: 'Endereço inválido', 
      message: 'Por favor informe o logradouro (mínimo 3 caracteres).', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
    return;
  }
  
  // Valida CEP se preenchido
  if (cep && !validateCEP(cep)) {
    showAlert({ 
      title: 'CEP inválido', 
      message: 'Por favor informe um CEP válido com 8 dígitos.', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showAlert({ 
        title: 'Erro', 
        message: 'Você precisa estar autenticado.', 
        confirmColor: theme.colors.error, 
        showCancelButton: false 
      });
      return;
    }

    // Prepara o payload com os campos separados
    const payload = {
      logradouro: logradouro.trim(),
      numero: numero ? numero.trim() : null,
      complemento: complemento ? complemento.trim() : null,
      bairro: bairro ? bairro.trim() : null,
      cidade: cidade ? cidade.trim() : null,
      estado: estado ? estado.trim().toUpperCase() : null,
      cep: cep ? unformat(cep) : null
    };

    console.log('Enviando endereço para atualização:', payload);

    // USA SEMPRE /usuario/me para usuário autenticado
    const response = await api.put('/usuario/me', payload, {
      headers: { 
        'access-token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta da atualização de endereço:', response.data);

    // Monta o endereço formatado para exibição
    const enderecoFormatado = `${logradouro}${numero ? ', ' + numero : ''}${complemento ? ' - ' + complemento : ''}${bairro ? ' - ' + bairro : ''}${cidade ? ' - ' + cidade : ''}${estado ? ' - ' + estado : ''}${cep ? ' - CEP: ' + cep : ''}`;
    
    // Atualiza o estado local
    setUserData(prev => ({ ...prev, endereco: enderecoFormatado }));
    
    showAlert({ 
      title: 'Sucesso', 
      message: 'Endereço atualizado com sucesso.', 
      confirmColor: theme.colors.success || theme.colors.primary, 
      showCancelButton: false 
    });
    
    closeEditModal();
    
    // Recarrega os dados para garantir sincronização
    await fetchUserData();
    
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    console.error('Detalhes do erro:', error.response?.data);
    
    const errorMessage = error.response?.data?.errors?.[0]?.msg 
      || error.response?.data?.message 
      || 'Não foi possível salvar o endereço. Tente novamente.';
    
    showAlert({ 
      title: 'Erro', 
      message: errorMessage, 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
  }
};

// ADICIONE também a função para buscar endereço por CEP (se não existir)
const fetchAddressByCEP = async (cep) => {
  const cepDigits = unformat(cep);
  
  if (cepDigits.length !== 8) {
    showAlert({ 
      title: 'CEP inválido', 
      message: 'Por favor informe um CEP com 8 dígitos.', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
    return;
  }

  try {
    // Busca o endereço via API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
    const data = await response.json();

    if (data.erro) {
      showAlert({ 
        title: 'CEP não encontrado', 
        message: 'Não foi possível encontrar o endereço para este CEP.', 
        confirmColor: theme.colors.error, 
        showCancelButton: false 
      });
      return;
    }

    // Preenche o formulário com os dados encontrados
    setAddressForm(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      bairro: data.bairro || prev.bairro,
      cidade: data.localidade || prev.cidade,
      estado: data.uf || prev.estado,
      cep: cepDigits
    }));

    showAlert({ 
      title: 'Sucesso', 
      message: 'Endereço encontrado! Verifique os dados e complete as informações necessárias.', 
      confirmColor: theme.colors.success || theme.colors.primary, 
      showCancelButton: false 
    });

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    showAlert({ 
      title: 'Erro', 
      message: 'Não foi possível buscar o endereço. Verifique sua conexão e tente novamente.', 
      confirmColor: theme.colors.error, 
      showCancelButton: false 
    });
  }
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
        
          // Usar o método logout do AuthContext
          await logout();
          // Remover dados adicionais
          await AsyncStorage.removeItem('user');
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
        <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow, paddingVertical: 14 }]}>
          <View style={[styles.headerTop, { paddingBottom: 6, marginBottom: 6 }] }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.imageWrapper}>
                {isLoading ? (
                  <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.border }]} />
                ) : userData.profileImage ? (
                  <Image source={{ uri: userData.profileImage }} style={styles.userImage} />
                ) : (
                  <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.primary }] }>
                    <FontAwesome6 name="user" size={60} color={theme.colors.text.inverse} />
                  </View>
                )}
                {/** camera badge (absolute at bottom-right) */}
                <TouchableOpacity onPress={changeProfilePhoto} style={[styles.cameraBadge, { backgroundColor: theme.colors.primary }] }>
                  <FontAwesome6 name="camera" size={16} color={theme.colors.text.inverse} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.nameText, { color: theme.colors.text.primary, fontSize: fontSize.lg }]}> 
              {userData.nome || 'Usuário'}
            </Text>
            <View style={styles.pointsContainer}>
              <Text style={[styles.pointsNumber, { color: theme.colors.primary, fontSize: fontSize.xl || fontSize.lg + 4 }]}>{userData.pontos || 0}</Text>
              <Text style={[styles.pointsLabel, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>Pontos</Text>
            </View>
          </View>
        </View>
        <View style={[styles.infoSection, { marginTop: 10 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontSize: fontSize.lg }]}>Informações Pessoais</Text>

          {/* Nome Completo */}
          <View style={[styles.infoRow, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="account" size={18} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>Nome Completo</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{userData.nome || ''}</Text>
            </View>
            <IconButton icon="pencil" size={18} iconColor={theme.colors.text.secondary} onPress={() => openEditModal('nome')} />
          </View>

          {/* CPF */}
          <View style={[styles.infoRow, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="card-account-details" size={18} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>CPF</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{formatCPF(userData.cpf || '')}</Text>
            </View>
            <IconButton icon="information" size={18} iconColor={theme.colors.text.secondary} onPress={() => showAlert({ title: 'CPF', message: 'Para alterar o CPF, por favor contate o suporte.', confirmText: 'Abrir email', cancelText: 'Cancelar', showCancelButton: true, onConfirm: async () => {
                  const email = 'ecosrev.suporte@gmail.com';
                  const subject = encodeURIComponent('Solicitação de alteração de CPF');
                  const body = encodeURIComponent(`Olá, gostaria de solicitar a alteração do meu CPF no sistema. Meu nome: ${userData.nome || ''}\nCPF atual: ${userData.cpf || ''}\nID do usuário: ${userData._id || ''}\n\nObrigado.`);
                  const url = `mailto:${email}?subject=${subject}&body=${body}`;
                  try {
                    const can = await Linking.canOpenURL(url);
                    if (can) await Linking.openURL(url);
                    else showAlert({ title: 'Erro', message: 'Não foi possível abrir o app de email no dispositivo.', confirmText: 'OK', showCancelButton: false });
                  } catch (err) {
                    console.error('Erro ao abrir email:', err);
                    showAlert({ title: 'Erro', message: 'Não foi possível abrir o app de email no dispositivo.', confirmText: 'OK', showCancelButton: false });
                  }
                } })} />
          </View>

          {/* Email */}
          <View style={[styles.infoRow, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="email-outline" size={18} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{userData.email || ''}</Text>
            </View>
            <IconButton icon="information" size={18} iconColor={theme.colors.text.secondary} onPress={() => showAlert({ title: 'Email', message: 'Para alterar o email, por favor contate o suporte.', confirmText: 'Abrir email', cancelText: 'Cancelar', showCancelButton: true, onConfirm: async () => {
                  const email = 'ecosrev.suporte@gmail.com';
                  const subject = encodeURIComponent('Solicitação de alteração de Email');
                  const body = encodeURIComponent(`Olá, gostaria de solicitar a alteração do meu email no sistema. Meu nome: ${userData.nome || ''}\nEmail atual: ${userData.email || ''}\nID do usuário: ${userData._id || ''}\n\nObrigado.`);
                  const url = `mailto:${email}?subject=${subject}&body=${body}`;
                  try {
                    const can = await Linking.canOpenURL(url);
                    if (can) await Linking.openURL(url);
                    else showAlert({ title: 'Erro', message: 'Não foi possível abrir o app de email no dispositivo.', confirmText: 'OK', showCancelButton: false });
                  } catch (err) {
                    console.error('Erro ao abrir email:', err);
                    showAlert({ title: 'Erro', message: 'Não foi possível abrir o app de email no dispositivo.', confirmText: 'OK', showCancelButton: false });
                  }
                } })} />
          </View>

          {/* Celular */}
          <View style={[styles.infoRow, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="phone" size={18} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>Celular</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{formatPhone(userData.celular || '')}</Text>
              
            </View>
            <IconButton icon="pencil" size={18} iconColor={theme.colors.text.secondary} onPress={() => openEditModal('celular')} />
          </View>

          {/* Endereço Completo */}
          <View style={[styles.infoRow, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>Endereço Completo</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{userData.endereco || ''}</Text>
            </View>
            <IconButton icon="pencil" size={18} iconColor={theme.colors.text.secondary} onPress={() => openEditModal('endereco')} />
          </View>

          {/* Logout está disponível em Ações Rápidas; removido botão duplicado aqui */}
          {/* Ações Rápidas */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface, padding: 12, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize.md, color: theme.colors.text.primary }]}>Ações Rápidas</Text>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Main', { screen: 'Configurações' })}>
              <MaterialCommunityIcons name="cog" size={18} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={handleLogout}>
              <MaterialCommunityIcons name="power" size={18} color={theme.colors.error} />
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="trash-can" size={18} color={theme.colors.error} />
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>Apagar minha conta</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      {/* Edit field modal */}
      <Modal
        visible={editModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize.md, color: theme.colors.text.primary }]}>Editar {editModal.field === 'endereco' ? 'Endereço' : editModal.field}</Text>

            {editModal.field === 'endereco' ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Logradouro</Text>
                <TextInput value={addressForm.logradouro} onChangeText={(t) => setAddressForm(prev => ({ ...prev, logradouro: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>Número</Text>
                <TextInput value={addressForm.numero} onChangeText={(t) => setAddressForm(prev => ({ ...prev, numero: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>Complemento</Text>
                <TextInput value={addressForm.complemento} onChangeText={(t) => setAddressForm(prev => ({ ...prev, complemento: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>Bairro</Text>
                <TextInput value={addressForm.bairro} onChangeText={(t) => setAddressForm(prev => ({ ...prev, bairro: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>Cidade</Text>
                <TextInput value={addressForm.cidade} onChangeText={(t) => setAddressForm(prev => ({ ...prev, cidade: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>Estado</Text>
                <TextInput value={addressForm.estado} onChangeText={(t) => setAddressForm(prev => ({ ...prev, estado: t }))} style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <Text style={[styles.label, { color: theme.colors.text.secondary, marginTop: 8 }]}>CEP</Text>
                <TextInput value={addressForm.cep} onChangeText={(t) => setAddressForm(prev => ({ ...prev, cep: t.replace(/\D/g, '').slice(0,8) }))} keyboardType="numeric" style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]} />
                <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                  <TouchableOpacity onPress={() => fetchAddressByCEP(addressForm.cep)} style={[styles.cepButton, { borderColor: theme.colors.primary }]}>
                    <Text style={{ color: theme.colors.primary }}>Buscar por CEP</Text>
                  </TouchableOpacity>
                </View>

                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity onPress={closeEditModal} style={[styles.button, styles.modalActionButton, { backgroundColor: theme.colors.border }]}>
                        <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveAddress} style={[styles.button, styles.modalActionButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.buttonText, { color: theme.colors.text.inverse }]}>Salvar Endereço</Text>
                      </TouchableOpacity>
                    </View>
              </ScrollView>
            ) : (
              <>
                {editModal.field === 'bio' ? (
                  <TextInput
                    value={bioEditing}
                    onChangeText={(text) => setBioEditing(text)}
                    placeholder={`Escreva sua bio`}
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                    style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary, height: 120, textAlignVertical: 'top' }]}
                  />
                ) : (
                  <TextInput
                    value={editModal.value}
                    onChangeText={(text) => {
                      let v = text;
                      if (editModal.field === 'cpf') v = formatCPF(text);
                      if (editModal.field === 'celular') v = formatPhone(text);
                      setEditModal(prev => ({ ...prev, value: v }));
                    }}
                    placeholder={`Digite ${editModal.field}`}
                    placeholderTextColor={theme.colors.text.secondary}
                    style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text.primary }]}
                  />
                )}
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity onPress={closeEditModal} style={[styles.button, styles.modalActionButton, { backgroundColor: theme.colors.border }]}>
                    <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveField} style={[styles.button, styles.modalActionButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.buttonText, { color: theme.colors.text.inverse }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    padding: 16,
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
  headerTop: {
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 6,
  },
  nameText: {
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitleText: {
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsNumber: {
    fontWeight: '700',
  },
  pointsLabel: {
    opacity: 0.8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  editProfileText: {
    fontWeight: '700',
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
  infoSection: {
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 480,
    borderRadius: 14,
    padding: 16,
    elevation: 4,
  },
  buttonCancel: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalActionButton: {
    flex: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  cameraBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: '#14AE5C',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  removeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  quickActionText: {
    marginLeft: 10,
    fontWeight: '600',
  },
  cepButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
});
