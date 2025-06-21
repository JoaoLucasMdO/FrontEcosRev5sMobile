//src\components\LoandingAnimation.js
import React, { useEffect } from "react";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "../contexts/ThemeContext";

const Animation = () => {
  const rotation = useSharedValue(0);
  const theme = useTheme();
  
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Estilo animado para aplicar rotação
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const createDottedC = (radius, dotSize) => {
    const result = [];
    const numDots = 11; // Número de pontos no C
    const openingAngle = 1.5; // Ângulo de abertura do C
    const startAngle = Math.PI * (1 - openingAngle / 2); // Ângulo inicial
    const endAngle = Math.PI * (1 + openingAngle / 2); // Ângulo final

    for (let i = 0; i < numDots; i++) {
      const angle = startAngle + (i / (numDots - 1)) * (endAngle - startAngle);
      const x = 50 + radius * Math.cos(angle); // Coordenada X
      const y = 50 + radius * Math.sin(angle); // Coordenada Y
      result.push({ x, y, r: dotSize }); // Salva posição e tamanho do ponto
    }

    return result;
  };

  // Configurações fixas dos "C"
  const outerCDots = createDottedC(35, 3.5); // C externo: raio 35, tamanho dos pontos 3.5
  const innerCDots = createDottedC(25, 2.5); // C interno: raio 25, tamanho dos pontos 2.5

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={100} height={80} viewBox="0 0 100 100">
        {/* Círculos externos do C maior */}
        {outerCDots.map((dot, index) => (
          <Circle key={`outer-${index}`} cx={dot.x} cy={dot.y} r={dot.r} fill="#a3e619" /> // Cor fixa para o C maior (externo)
        ))}

        {/* Círculos internos do C menor */}
        {innerCDots.map((dot, index) => (
          <Circle key={`inner-${index}`} cx={dot.x} cy={dot.y} r={dot.r} fill="#a8c35f" /> // Cor fixa para o C menor (interno)
        ))}
        
        <SvgText
          x="50" // Centraliza horizontalmente
          y="60" // Centraliza verticalmente
          textAnchor="middle"
          fontSize="25"
          fontWeight="bold"
          fill={theme.colors.text.primary} // Cor muda de acordo com o tema
        >
          E
        </SvgText>
      </Svg>
    </Animated.View>
  );
};

export default Animation;