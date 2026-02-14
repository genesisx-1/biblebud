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
import BibleReaderScreen from '../screens/BibleReaderScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

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
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: theme.colors.primary.royalBlue,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: theme.colors.primary.pureWhite,
          headerTitleStyle: {
            fontWeight: theme.typography.fontWeight.semibold,
            fontSize: theme.typography.fontSize.lg,
          },
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Bible Bro',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: theme.colors.primary.royalBlue,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: theme.colors.primary.pureWhite,
          headerTitleStyle: {
            fontWeight: theme.typography.fontWeight.semibold,
            fontSize: theme.typography.fontSize.lg,
          },
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
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
          } else if (route.name === 'Bible') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Quiz') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.royalBlue,
        tabBarInactiveTintColor: theme.colors.text.light,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          borderTopWidth: 0.5,
          paddingBottom: 6,
          paddingTop: 6,
          height: 56,
          ...theme.shadows.small,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary.royalBlue,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.colors.primary.pureWhite,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semibold,
          fontSize: theme.typography.fontSize.lg,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleReaderScreen}
        options={{
          title: 'Bible',
        }}
      />
      <Tab.Screen
        name="Plans"
        component={ReadingPlansScreen}
        options={{
          title: 'Plans',
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Quiz',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
