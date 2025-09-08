// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './contexts/authContext';

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("Is authenticated ==>", isAuthenticated);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#e82727ff' 
      }}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}