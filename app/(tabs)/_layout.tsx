import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {

const insets = useSafeAreaInsets();
const bottomPadding = Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 20) + 10;
const tabBarHeight = Platform.OS === 'web' ? 70 : 50 + Math.max(insets.bottom, 20) + 10;

// Then use bottomPadding and tabBarHeight in your tabBarStyle
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff4757',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#2c2c2e',
          borderTopColor: '#3a3a3c',
          borderTopWidth: 1,
          paddingBottom: bottomPadding, // Dynamic padding based on device
          paddingTop: 8,
          height: tabBarHeight,// Dynamic height
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderBoard"
        options={{
          title: 'LeaderBoard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'trophy' : 'trophy-outline'} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}