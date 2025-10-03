import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function QRCodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [cameraKey, setCameraKey] = useState(0); // Força remontagem da câmera
  const theme = useTheme();
  const { fontSize, fontFamily } = useFontSettings();
  const [token, setToken] = useState(null);
  const navigation = useNavigation();
  const scanningRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Reseta o estado quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      scanningRef.current = false;
      setCameraKey(prev => prev + 1); // Força remontagem da câmera
      
      return () => {
        // Cleanup quando a tela perde o foco
        setScanned(false);
        scanningRef.current = false;
      };
    }, [])
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text.primary, fontSize: fontSize.md, fontFamily }]}>
          Precisamos de permissão para usar a câmera
        </Text>
        <Button
          onPress={requestPermission}
          title="Permitir Câmera"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  const fetchUserPoints = async () => {
    if (!token) return 0;

    try {
      const response = await api.get(`/usuario/pontos`, {
        headers: { "access-token": token }
      });

      if (response.data) {
        return response.data.pontos;
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }

    return 0;
  };

  const updateUserPoints = async (pontos, hash) => {
    if (!token) return { success: false, message: 'Token não encontrado' };

    try {
      const currentPoints = await fetchUserPoints();
      const newPoints = currentPoints + pontos;

      await api.put(
        `/usuario/pontos`,
        { pontos: newPoints },
        { headers: { "access-token": token } }
      );

      await api.post(`/hist/pontos`, {
        idUsuario: await AsyncStorage.getItem('user'),
        pontos: pontos,
        id: hash
      });

      console.log('Pontos atualizados com sucesso');
      return { success: true, message: 'Pontos adicionados com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      
      // Verifica se o erro é de cupom duplicado
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Se o backend retornou mensagem específica de cupom duplicado
        if (errorData.code === 'DUPLICATE_COUPON' || errorData.error?.includes('cupom já foi resgatado')) {
          return { 
            success: false, 
            message: 'Este cupom já foi resgatado anteriormente.' 
          };
        }
        
        // Outros erros 400
        return { 
          success: false, 
          message: errorData.error || 'Erro ao processar o cupom.' 
        };
      }
      
      // Erro genérico
      return { 
        success: false, 
        message: 'Não foi possível registrar os pontos. Tente novamente.' 
      };
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanningRef.current) return; // Bloqueia múltiplas leituras
    scanningRef.current = true;

    try {
      const parsedData = JSON.parse(data);
      setScanned(true);
      setScannedData(parsedData); // mantenha como objeto

      console.log(parsedData.hash);
      console.log(parsedData.pontos);

      // Aguarda o resultado da atualização
      const result = await updateUserPoints(parsedData.pontos, parsedData.hash);
      
      if (result.success) {
        setAlertTitle("QR Code Escaneado");
        setAlertMessage(`Você recebeu ${parsedData.pontos} pontos!`);
      } else {
        setAlertTitle("Erro");
        setAlertMessage(result.message);
      }
      
      setAlertVisible(true);
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      setAlertTitle("Erro");
      setAlertMessage("QR Code inválido ou erro ao processar.");
      setScanned(true);
      setAlertVisible(true);
    }
  };

  // Quando fechar o alerta, libera para novo scan
  const handleCloseAlert = () => {
    setAlertVisible(false);
    setScanned(false);
    scanningRef.current = false; // Libera para novo scan
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CameraView
        key={cameraKey} // Força remontagem quando a key muda
        style={styles.camera}
        facing="back"
        barCodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Text style={[styles.overlayText, { fontSize: fontSize.md, fontFamily, color: theme.colors.text.primary }]}>
            Posicione o QR Code dentro da área
          </Text>
        </View>
      </CameraView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
        onConfirm={() => {
          setAlertVisible(false);
          setScanned(false);
          scanningRef.current = false;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontWeight: 'bold',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
});