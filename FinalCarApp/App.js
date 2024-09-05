import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './Screens/HomeScreen';
import DocumentsScreen from './Screens/DocumentsScreen';
import Parking from './Screens/Parking';
import UpdateDetailsScreen from './Screens/UpdateDetails';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import ProfileScreen from './Screens/ProfileScreen';
import Map from './Screens/Map';
import ChatBot from './Screens/ChatBot';
import Services from './Screens/Services';
import CarComponents from './Screens/CarComponents';
import WelcomePage from './Screens/WelcomePage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Home and related screens
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerStyle: { backgroundColor: 'black' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => null,
      headerRight: () => (
        <View style={styles.headerIconsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerButton}
          >
            <Icon name="person-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Welcome')}
            style={styles.headerButton}
          >
            <Icon name="home-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    })}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
    <Stack.Screen
      name="Documents"
      component={DocumentsScreen}
      options={({ navigation }) => ({
        title: 'Documents',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.headerButton}>
            <Icon name="arrow-back-outline" size={25} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    />
   <Stack.Screen
      name="Parking"
      component={Parking}
      options={{ 
        headerShown: false, // Hide header for Parking screen
      }}
    />
    <Stack.Screen
      name="UpdateDetails"
      component={UpdateDetailsScreen}
      options={({ navigation }) => ({
        title: 'Update Details',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.headerButton}>
            <Icon name="arrow-back-outline" size={25} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={({ navigation }) => ({
        title: 'Profile',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerButton}>
            <Icon name="arrow-back-outline" size={25} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    />
    <Stack.Screen
      name="CarComponents"
      component={CarComponents}
      options={({ navigation }) => ({
        title: 'Car Components',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.headerButton}>
            <Icon name="arrow-back-outline" size={25} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    />
  </Stack.Navigator>
);


// Stack Navigator for Services
const ServicesStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerStyle: { backgroundColor: 'black' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => null, // Remove the back arrow
      headerRight: () => (
        <View style={styles.headerIconsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerButton}
          >
            <Icon name="person-outline" size={25} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Welcome')}
            style={styles.headerButton}
          >
            <Icon name="home-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    })}
  >
    <Stack.Screen
      name="Services"
      component={Services}
      options={{ title: 'Services' }}
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'Map':
            iconName = 'map-outline';
            break;
          case 'ChatBot':
            iconName = 'chatbubbles-outline';
            break;
          case 'Services':
            iconName = 'construct-outline';
            break;
          default:
            iconName = 'ellipse-outline';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FFFF00',
      tabBarInactiveTintColor: 'white',
      tabBarStyle: {
        paddingBottom: 5,
        backgroundColor: 'black',
      }, // Add a little padding to the bottom of the tab bar
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
    <Tab.Screen name="Map" component={Map} options={{ title: 'Map' }} />
    <Tab.Screen name="ChatBot" component={ChatBot} options={{ title: 'ChatBot' }} />
    <Tab.Screen name="Services" component={ServicesStack} options={{ title: 'Services' }} />
  </Tab.Navigator>
);

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabNavigator" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 10,
    padding: 10,
  },
});

export default App;
