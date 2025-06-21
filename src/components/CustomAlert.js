import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useFontSettings } from "../contexts/FontContext";

const CustomAlert = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  confirmColor,
  cancelColor,
  showCancelButton = true,
  singleButtonText = "OK"
}) => {
  const { colors } = useTheme();
  const { fontSize, fontFamily } = useFontSettings();
  const [animation] = React.useState(new Animated.Value(0));

  // Cores padrão se não forem fornecidas
  const buttonConfirmColor = confirmColor || colors.secondary;
  const buttonCancelColor = cancelColor || colors.secondary;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertBox,
            {
              backgroundColor: colors.surface,
              transform: [{ scale }],
              opacity,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <Text
              style={[
                styles.title,
                { color: colors.primary, fontSize: fontSize.lg, fontFamily },
              ]}
            >
              {title}
            </Text>
            <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
          </View>

          <Text
            style={[
              styles.message,
              { color: colors.text.primary, fontSize: fontSize.md, fontFamily },
            ]}
          >
            {message}
          </Text>

          <View style={[
            styles.buttonContainer,
            !showCancelButton && styles.singleButtonContainer
          ]}>
            {showCancelButton ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: buttonCancelColor }
                  ]}
                  onPress={onCancel || onClose}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: buttonCancelColor,
                      fontSize: fontSize.md,
                      fontFamily,
                      fontWeight: '500'
                    }}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: buttonConfirmColor }
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: fontSize.md,
                      fontFamily,
                      fontWeight: '600'
                    }}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.singleButton,
                  { backgroundColor: buttonConfirmColor }
                ]}
                onPress={onConfirm || onClose} // Usa onConfirm se estiver definido, senão usa onClose
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: colors.onError,
                    fontSize: fontSize.md,
                    fontFamily,
                    fontWeight: '600'
                  }}
                >
                  {singleButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const alertWidth = Math.min(width * 0.85, 320);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  alertBox: {
    width: alertWidth,
    padding: 22,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  indicator: {
    height: 3,
    width: 40,
    borderRadius: 3,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  singleButtonContainer: {
    justifyContent: "center",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmButton: {
    elevation: 2,
  },
  singleButton: {
    maxWidth: "60%",
    elevation: 2,
  },
});

export default CustomAlert;