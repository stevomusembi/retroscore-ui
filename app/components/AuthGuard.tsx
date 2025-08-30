// // components/AuthGuard.tsx
// import { router, useSegments } from 'expo-router';
// import React, { useEffect } from 'react';
// import { ActivityIndicator, StyleSheet, View } from 'react-native';
// import { useAuth } from '../contexts/authContext';

// interface AuthGuardProps {
//   children: React.ReactNode;
// }

// export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const segments:any = useSegments();

//   useEffect(() => {
//     if (isLoading) return;

//     const inAuthGroup = segments.includes('auth');
//     const inProtectedGroup = segments[0] === '(tabs)' || segments.length === 0;

//     console.log('Auth Guard - isAuthenticated:', isAuthenticated, 'segments:', segments);

//     if (!isAuthenticated && inProtectedGroup) {
//       // User is not authenticated and trying to access protected routes
//       // router.replace('/(auth)/login'as any);
//       router.replace('/(tabs)/home');


//     } else if (isAuthenticated && inAuthGroup) {
//       // User is authenticated but still on auth screens
//       router.replace('/(tabs)/home');
//     }
//   }, [isAuthenticated, isLoading, segments]);

//   // Show loading screen while checking authentication
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4285f4" />
//       </View>
//     );
//   }

//   return <>{children}</>;
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#000000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });