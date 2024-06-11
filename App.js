import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./components/Home";
import Repeat from "./components/Repeat"; // Corrected import statement
import { Ionicons } from "@expo/vector-icons";
import Settings from "./components/Settings";
import { View, Text, StyleSheet, Button, StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { initLocalization } from "./components/multilanguage/languageService"; // Adjust the import path as necessary

import * as design from "./components/common/styles";
const Tab = createBottomTabNavigator();
// import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

// const Tab = createMaterialBottomTabNavigator();
const App = () => {
  const [error, setError] = useState(null);

  // useEffect to log errors
  useEffect(() => {
    if (error) {
      console.error("An error occurred:", error);
      // You can also send the error to your logging service here
    }
  }, [error]);

  // Error boundary component
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      // Update state to trigger the error UI
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      // Log the error to an error reporting service
      setError(error);
    }

    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <Text>Something went wrong.</Text>;
      }

      return this.props.children;
    }
  }
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: "center",
          tabBarActiveBackgroundColor: design.colors.purple08,
          tabBarActiveTintColor: design.colors.white,
          activeColor: design.colors.white,
          inactiveColor: design.colors.white,
          tabBarActiveTintColor: design.colors.white, // Set active color to red
          tabBarInactiveTintColor: design.colors.purple08, // Set inactive color to white
          tabBarLabelStyle: {
            fontSize: 9.6, // Adjust the font size as needed
            fontWeight: "400",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitleStyle: {
              color: design.colors.headerTitleColor,
            },
            headerStyle: {
              backgroundColor: design.colors.purple08,
            },
            labelStyle: {
              fontSize: 10,
              margin: 0,
              padding: 0,
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
            tabBarLabel: "Home",
          }}
        />
        <Tab.Screen
          name="Repeat"
          component={Repeat}
          options={{
            headerTitleStyle: {
              color: design.colors.headerTitleColor,
            },
            headerStyle: {
              backgroundColor: design.colors.purple08,
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="repeat" size={24} color={color} />
            ),
            tabBarLabel: "Repeat",
          }}
        />

        {/* <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            headerTitleStyle: {
              color: design.colors.headerTitleColor,
            },
            headerStyle: {
              backgroundColor: design.colors.purple08,
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={24} color={color} />
            ),
            tabBarLabel: "Settings",
          }}
        /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
