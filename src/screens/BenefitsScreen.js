import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { IconButton } from "react-native-paper";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import api from "../services/api";


const BenefitsScreen = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [benefits, setBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { fontSize } = useFontSettings();
  const route = useRoute();
  
  useEffect(() => {
    if (route.params?.refresh) {
      fetchUserPoints();
    }
  }, [route.params?.refresh]);

  useEffect(() => {
    filterBenefits();
  }, [searchQuery, benefits]);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const fetchUserPoints = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.get(`/usuario/pontos`, {
        headers: { "access-token": token }
      });

      if (response.data && response.data.pontos !== undefined) {
        setUserPoints(response.data.pontos);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  const fetchBenefits = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.get(`/beneficio`, {
        headers: { "access-token": token }
      });

      const availableBenefits = response.data.filter(benefit => benefit.quantidade > 0);
      setBenefits(availableBenefits);
    } catch (error) {
      console.error("Error fetching benefits:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBenefits = () => {
    if (searchQuery.trim() === "") {
      setFilteredBenefits(benefits);
    } else {
      const filtered = benefits.filter(benefit =>
        benefit.nome.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBenefits(filtered);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await fetchUserPoints();
        await fetchBenefits();
      };
      loadData();
    }, [])
  );

  const handleRedeemBenefit = (benefit) => {
    if (userPoints >= benefit.pontos) {
      setSelectedBenefit(benefit);
      setIsError(false);
      setAlertVisible(true);
    } else {
      setSelectedBenefit({
        nome: "Pontos Insuficientes",
        endereco: "Você não tem pontos suficientes para este benefício."
      });
      setIsError(true);
      setAlertVisible(true);
    }
  };

  const confirmRedeem = async () => {
    console.log(selectedBenefit)
    try {
      const response = await api.post(
        `/hist/transacoes`,
        {
          idUsuario: await AsyncStorage.getItem('user'),
          pontos: selectedBenefit.pontos,
          descricao: selectedBenefit.nome,
          idBeneficio: selectedBenefit.id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Resposta:', response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
    if (isError || (selectedBenefit && selectedBenefit.nome === "Resgate Concluído")) {
      setAlertVisible(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const newPoints = userPoints - selectedBenefit.pontos;
      await api.put(
        `/usuario/pontos`,
        { pontos: newPoints },
        { headers: { "access-token": token } }
      );

      const newQuantity = selectedBenefit.quantidade - 1;
      await api.put(
        `/beneficio/resgate`,
        {
          id: selectedBenefit.id,
          quantidade: newQuantity
        },
        { headers: { "access-token": token } }
      );

      setUserPoints(newPoints);
      await fetchBenefits();
      setAlertVisible(false);

      setTimeout(() => {
        setSelectedBenefit({
          nome: "Resgate Concluído",
          endereco: `Você resgatou: ${selectedBenefit.nome} com sucesso!`
        });
        setIsError(false);
        setAlertVisible(true);
      }, 300);
    } catch (error) {
      console.error("Error redeeming benefit:", error);
      setSelectedBenefit({
        nome: "Erro no Resgate",
        endereco: "Ocorreu um erro ao resgatar o benefício. Tente novamente mais tarde."
      });
      setIsError(true);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const getAlertMessage = () => {
    if (isError) {
      return selectedBenefit?.endereco;
    }
    if (selectedBenefit?.nome === "Resgate Concluído") {
      return selectedBenefit?.endereco;
    }
    return `Deseja resgatar: ${selectedBenefit?.nome}? Serão utilizados ${selectedBenefit?.pontos} pontos.`;
  };

  if (loading) {
    return (
      <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.text.primary }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.pointsHeader}>
          <IconButton icon="gift" size={24} iconColor={theme.colors.primary} style={{ margin: 0 }} />
          <Text style={[styles.pointsText, { color: theme.colors.text.primary, fontSize: fontSize.lg }]}>Seus Pontos: </Text>
          <Text style={[styles.pointsText, { color: theme.colors.info, fontSize: fontSize.lg }]}>{userPoints}</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, marginHorizontal: 15, marginTop: 10 }]}>
        <IconButton icon="magnify" size={20} iconColor={theme.colors.text.secondary} style={{ margin: 0 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary, fontSize: fontSize.md }]}
          placeholder="Buscar benefício..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <IconButton 
            icon="close" 
            size={20} 
            iconColor={theme.colors.text.secondary} 
            style={{ margin: 0 }} 
            onPress={() => setSearchQuery("")}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollViewContent, { marginTop: 10 }]} showsVerticalScrollIndicator={false}>
        {filteredBenefits.length > 0 ? (
          filteredBenefits.map((benefit) => (
            <TouchableOpacity
              key={benefit.id}
              style={[styles.benefitCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleRedeemBenefit(benefit)}
            >
              <View style={styles.benefitDetails}>
                <Text style={[styles.benefitTitle, { color: theme.colors.text.primary, fontSize: fontSize.md }]}>{benefit.nome}</Text>
                <Text style={[styles.benefitDescription, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>{benefit.endereco}</Text>
                <View style={styles.pointsContainer}>
                  <IconButton icon="ticket" size={20} iconColor={theme.colors.info} style={{ margin: 0 }} />
                  <Text style={[styles.benefitPoints, { color: theme.colors.info, fontWeight: "bold", fontSize: fontSize.sm }]}>{benefit.pontos} pontos</Text>
                </View>
                <Text style={[styles.quantity, { color: theme.colors.text.secondary, fontSize: fontSize.xs }]}>Disponíveis: {benefit.quantidade}</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleRedeemBenefit(benefit)}
              >
                <Text style={[styles.redeemButtonText, { color: theme.colors.text.inverse, fontWeight: "bold", fontSize: fontSize.sm }]}>Resgatar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {searchQuery.trim() !== "" 
                ? "Nenhum benefício encontrado com esse nome."
                : "Não há benefícios disponíveis no momento."}
            </Text>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={
          isError || selectedBenefit?.nome === "Resgate Concluído"
            ? () => setAlertVisible(false)
            : confirmRedeem
        }
        title={
          isError || selectedBenefit?.nome === "Resgate Concluído"
            ? selectedBenefit?.nome
            : "Confirmar Resgate"
        }
        message={getAlertMessage()}
        confirmText={
          isError || selectedBenefit?.nome === "Resgate Concluído"
            ? "Ok"
            : "Resgatar"
        }
        cancelText="Cancelar"
        confirmColor={isError ? theme.colors.info : theme.colors.primary}
        showCancelButton={
          !(isError || selectedBenefit?.nome === "Resgate Concluído")
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingVertical: 15, paddingHorizontal: 20 },
  pointsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pointsText: { marginLeft: 10, fontWeight: "bold" },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderRadius: 10, 
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 8,
    paddingHorizontal: 5
  },
  scrollViewContent: { paddingVertical: 20, paddingHorizontal: 15 },
  benefitCard: { borderRadius: 10, marginBottom: 15, flexDirection: "row", alignItems: "center", padding: 15 },
  benefitDetails: { flex: 1 },
  benefitTitle: { fontWeight: "bold" },
  benefitDescription: { marginTop: 5 },
  pointsContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  benefitPoints: { marginLeft: 5, fontWeight: "bold" },
  quantity: { marginTop: 5, fontStyle: "italic" },
  redeemButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  redeemButtonText: { fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { textAlign: 'center', fontSize: 16 },
});

export default BenefitsScreen;