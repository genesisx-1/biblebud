import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ReadingPlansScreen from '../screens/ReadingPlansScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BibleReadingScreen from '../screens/BibleReadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BibleReading" 
        component={BibleReadingScreen}
        options={{
          title: 'Today\'s Reading',
          headerStyle: {
            backgroundColor: theme.colors.primary.royalBlue,
          },
          headerTintColor: theme.colors.primary.pureWhite,
        }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Quiz') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.royalBlue,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary.royalBlue,
        },
        headerTintColor: theme.colors.primary.pureWhite,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Bible Bro',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Bible Chat',
        }}
      />
      <Tab.Screen
        name="Plans"
        component={ReadingPlansScreen}
        options={{
          title: 'Reading Plans',
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Bible Quiz',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
