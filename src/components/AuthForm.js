// src/components/AuthForm.js
import { Text, View, StyleSheet, Platform } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { Formik } from 'formik';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';

const AuthForm = ({ initialValues, validationSchema, onSubmit, fields, isPasswordVisible, togglePasswordVisibility, errorMessages, children }) => {
  const theme = useTheme();
  const { fontSize } = useFontSettings();
  
  // Cria uma configuração completa de tema para o React Native Paper TextInput
  const paperTheme = {
    colors: {
      text: theme.colors.text.primary,
      placeholder: theme.colors.text.disabled,
      background: theme.colors.surface,
      primary: theme.colors.primary,
      surface: theme.colors.surface,
      error: theme.colors.error,
      // Para garantir que o texto seja visível no tema escuro
      onSurface: theme.colors.text.primary,
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, touched, setFieldValue, setFieldTouched }) => (
        <View>
          {fields.map((field) => (
            <View key={field.name} style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text.primary, fontSize: fontSize.sm }]}>
                {field.label}
              </Text>
              <TextInput
                value={values[field.name]}
                onChangeText={handleChange(field.name)}
                style={{ 
                  backgroundColor: theme.colors.surface, 
                  marginBottom: 8,
                  height: 40,
                  color: theme.colors.text.primary,
                  // Forçar a cor do texto para garantir visibilidade
                  ...(Platform.OS === 'ios' ? {color: theme.colors.text.primary} : {})
                }}
                mode="outlined"
                activeOutlineColor={theme.colors.primary}
                outlineColor={theme.colors.text.disabled}
                secureTextEntry={field.secureTextEntry && !isPasswordVisible}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.text.disabled}
                autoCapitalize={field.autoCapitalize || "none"}
                keyboardType={field.keyboardType || "default"}
                theme={paperTheme}
                right={
                  field.secureTextEntry ? (
                    <TextInput.Icon
                      icon={() =>
                        <IconButton 
                          icon={isPasswordVisible ? "eye-off" : "eye"} 
                          size={24} 
                          iconColor={theme.colors.text.disabled}
                          style={{ margin: 0 }}
                        />
                      }
                      onPress={togglePasswordVisibility}
                    />
                  ) : null
                }
                error={touched[field.name] && errors[field.name]}
              />
              {touched[field.name] && errors[field.name] && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 16 }}>
                  {errors[field.name]}
                </Text>
              )}
              {errorMessages && errorMessages[field.name] && (
                <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 16 }}>
                  {errorMessages[field.name]}
                </Text>
              )}
            </View>
          ))}
          {typeof children === 'function' ? children({ handleSubmit, values, setFieldValue, setFieldTouched }) : children}
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 6,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'left',
  }
});

export default AuthForm;
