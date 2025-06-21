// Modificamos o fluxo para ter um Stack Navigator de alto nível
export function MainNavigation() {
  const { isAuthenticated } = useAuth();
  
  // Usamos um Stack Navigator principal para poder ter acesso a todas as telas
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="AppStack" component={AppStack} />
          {/* ResetPassword também precisa estar acessível quando autenticado */}
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ gestureEnabled: false }}
          />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}