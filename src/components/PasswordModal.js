import React, { useState } from "react";
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext"; // Usando hook personalizado
import api from "../services/api";

const PasswordModal = ({ isVisible, onClose, onSave, theme, fontSize }) => {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { token } = useAuth(); // Usando o hook personalizado

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return Alert.alert("Erro", "Todos os campos são obrigatórios.");
    }

    if (novaSenha !== confirmarSenha) {
      return Alert.alert("Erro", "As senhas não coincidem.");
    }

    try {
      const response = await api.put(
        "/usuario/senha",
        {
          senhaAtual,
          novaSenha,
        },
        {
          headers: {
            "access-token": token,
          },
        }
      );

      // Limpar os campos
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      
      // Chamar o callback onSave para notificar sucesso
      if (onSave) onSave();
      else onClose(); // Se não tiver onSave, apenas fecha o modal
      
    } catch (error) {
      const msg = error.response?.data?.msg || "Erro ao atualizar a senha.";
      Alert.alert("Erro", msg);
    }
  };

  // Se não estiver visível, não renderiza nada
  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer, 
          theme && { backgroundColor: theme.colors.surface }
        ]}>
          <Text style={[
            styles.title, 
            theme && { color: theme.colors.text.primary },
            fontSize && { fontSize: fontSize.lg }
          ]}>
            Alterar Senha
          </Text>

          <TextInput
            style={[
              styles.input,
              theme && { 
                borderColor: theme.colors.border,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background
              },
              fontSize && { fontSize: fontSize.md }
            ]}
            placeholder="Senha Atual"
            secureTextEntry
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholderTextColor={theme?.colors.text.secondary || "#999"}
          />

          <TextInput
            style={[
              styles.input,
              theme && { 
                borderColor: theme.colors.border,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background
              },
              fontSize && { fontSize: fontSize.md }
            ]}
            placeholder="Nova Senha"
            secureTextEntry
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholderTextColor={theme?.colors.text.secondary || "#999"}
          />

          <TextInput
            style={[
              styles.input,
              theme && { 
                borderColor: theme.colors.border,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background
              },
              fontSize && { fontSize: fontSize.md }
            ]}
            placeholder="Confirmar Nova Senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholderTextColor={theme?.colors.text.secondary || "#999"}
          />

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[
                styles.button, 
                theme && { backgroundColor: theme.colors.primary }
              ]} 
              onPress={handleChangePassword}
            >
              <Text style={[
                styles.buttonText, 
                theme && { color: theme.colors.text.inverse },
                fontSize && { fontSize: fontSize.md }
              ]}>
                Salvar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.cancelButton,
                theme && { backgroundColor: theme.colors.secondary || "#6c757d" }
              ]} 
              onPress={onClose}
            >
              <Text style={[
                styles.buttonText,
                theme && { color: theme.colors.text.inverse },
                fontSize && { fontSize: fontSize.md }
              ]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PasswordModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});