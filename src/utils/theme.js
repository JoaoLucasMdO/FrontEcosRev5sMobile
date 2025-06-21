//src\utils\theme.js
import { useColorScheme } from 'react-native';

const lightTheme = {
    colors: {
      primary: '#14AE5C',      // Verde principal
      secondary: '#2ecc71',    // Verde secundário
      background: '#f4f4f4',   // Fundo principal (claro)
      surface: '#fefffa',      // Superfície (ex.: cartões ou contêineres)
      error: '#CF6679',        // Mensagens de erro
      statusbar:'#333333',
      text: {
        primary: '#505050',    // Texto principal
        secondary: '#9E9E9E',  // Texto secundário
        disabled: '#D3D3D3',   // Texto desabilitado
        inverse: '#FFFFFF',    // Texto em fundos escuros
      },
      border: '#E0E0E0',       // Bordas
      success: '#4CAF50',      // Mensagens de sucesso
      warning: '#FFC107',      // Alertas
      info: '#a8c35f',         // Informações
      shadow: '#000',          // Cor da sombra
      overlay: 'rgba(255, 255, 255, 0.4)',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 9999,
    },
    shadows: {
      none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
    metrics: {
      screenWidth: null, // Será atualizado em runtime
      screenHeight: null, // Será atualizado em runtime
      statusBarHeight: 24, // Valor padrão, será atualizado em runtime
      headerHeight: 56,
      tabBarHeight: 56,
      contentPadding: 16, // Usando o valor de spacing.md
    },
    breakpoints: {
      phone: 0,
      tablet: 768,
    },
    updateMetrics: function(dimensions) {
      this.metrics.screenWidth = dimensions.width;
      this.metrics.screenHeight = dimensions.height;
    }
};

const darkTheme = {
    colors: {
      primary: '#22C55E',      
      secondary: '#2ecc71',   
      background: '#121212',
      surface: '#1E1E1E',
      error: '#F44336',
      statusbar:'#333333',
      text: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
        disabled: '#D3D3D3',
        inverse: '#000000',
      },
      border: '#333333',
      success: '#4CAF50',
      warning: '#FFC107',
      info: '#a8c35f',
      shadow: '#fff',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 9999,
    },
    shadows: {
      none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
    metrics: {
      screenWidth: null,
      screenHeight: null,
      statusBarHeight: 24,
      headerHeight: 56,
      tabBarHeight: 56,
      contentPadding: 16,
    },
    breakpoints: {
      phone: 0,
      tablet: 768,
    },
    updateMetrics: function(dimensions) {
      this.metrics.screenWidth = dimensions.width;
      this.metrics.screenHeight = dimensions.height;
    }
};

// Hook para definir qual tema usar automaticamente
const useTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme, useTheme };

// usado pra corrigir o bug: colors doesn't exist
export default {
  light: lightTheme,
  dark: darkTheme,
  useTheme
};