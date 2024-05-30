import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HistoryScreen from "./components/HistoryScreen";
import StatisticsScreen from "./components/StatisticsScreen";
import ProfileScreen from "./components/ProfileScreen";
import WeightTracker from "./components/WeightTracker";
import TodaysWeight from "./components/TodaysWeight";
import { Ionicons } from "@expo/vector-icons";
import {
  shouldShowWeightPopupFunc,
  showProfile,
} from "./components/functions/todayWeight";
import { AppProvider } from "./components/AppContext";
import { useFocusEffect } from "@react-navigation/native";
import {
  translate,
  setLanguage,
  initLocalization,
} from "./components/multilanguage/languageService";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  scheduleDailyNotification,
} from "./components/notifications/Notifications";
import { StatusBar } from "react-native";
import Toast from "react-native-root-toast";

import * as design from "./components/common/styles";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
const Tab = createBottomTabNavigator();

const App = () => {
  const [shouldShowWeightPopup, setShouldShowWeightPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // const [fontsLoaded] = useFonts({
  //   'opensans-regular': require('./assets/OpenSans-Regular.ttf'),
  // });
  const [currentLanguage, setCurrentLanguage] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false); // State for font loading
  // Inside your component
  const showToast = (message) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
    });
  };

  useEffect(() => {
    const setupSplashScreen = async () => {
      await SplashScreen.preventAutoHideAsync();
      // Check for font loading here
      try {
        await initFonts();
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error loading fonts:", error);
        await SplashScreen.hideAsync();
      }
    };

    const initFonts = async () => {
      try {
        await Promise.all([
          Font.loadAsync({
            "opensans-regular": require("./assets/OpenSans-Regular.ttf"),
          }),
        ]);
        setFontsLoaded(true); // Set font loading state to true
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    };

    setupSplashScreen();

    const setupNotifications = async () => {
      try {
        var status = await registerForPushNotificationsAsync();
        if (status != "granted") return;
        await scheduleDailyNotification();

        const subscription =
          Notifications.addNotificationResponseReceivedListener(
            async (response) => {
              // Handle the notification response here
            }
          );

        return () => {
          subscription.remove(); // Clean up the listener when the component unmounts
        };
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };
    setupNotifications();
    const userCountry = "RO"; // Simulated country code
    if (userCountry === "RO") {
      initLocalization().then((r) => {
        setCurrentLanguage(r);
      });
    }
    shouldShowWeightPopupFunc().then((result) => {
      setShouldShowWeightPopup(result);
      console.log(
        "App component setShouldShowWeightPopup: " + shouldShowWeightPopup
      );
    });
    showProfile().then((result) => {
      setShowProfilePopup(result);
      console.log("App component showProfilePopup: " + showProfilePopup);
    });
  }, [currentLanguage]);

  // if (!fontsLoaded) {
  //   return <AppLoading />;
  // }
  if (!fontsLoaded) {
    return null; // You can return a loading screen here if needed
  }
  return (
    <AppProvider>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <NavigationContainer
        navigationOptions
        screenOptions={({ route }) => ({
          headerTitleAlign: "center",
          tabBarStyle: {
            height: 90,
            paddingHorizontal: 5,
            paddingTop: 0,
            position: "absolute",
            borderTopWidth: 0,
          },
        })}
      >
        {showProfilePopup ? (
          <ProfileScreen
            setShowProfilePopup={setShowProfilePopup}
          ></ProfileScreen>
        ) : !shouldShowWeightPopup ? (
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
              name="WeightTracker"
              component={WeightTracker}
              options={{
                headerTitleStyle: {
                  color: design.colors.headerTitleColor,
                  fontFamily: "opensans-regular",
                },
                headerStyle: {
                  backgroundColor: design.colors.purple08,
                },
                labelStyle: {
                  fontSize: 10,
                  margin: 0,
                  padding: 0,
                },
                title: translate("graphOverview"),
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="ios-home" size={24} color={color} /> // Set size to 24 and color to blue
                ),
              }}
            />
            <Tab.Screen
              name="Weight history"
              component={HistoryScreen}
              options={{
                headerTitleStyle: {
                  color: design.colors.headerTitleColor,
                  fontFamily: "opensans-regular",
                },
                headerStyle: {
                  backgroundColor: design.colors.purple08,
                },
                title: translate("weightHistory"),
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="ios-time" size={24} color={color} /> // Set size to 24 and color to blue
                ),
              }}
            />
            <Tab.Screen
              name="Body Mass Index"
              component={StatisticsScreen}
              options={{
                headerTitleStyle: {
                  color: design.colors.headerTitleColor,
                  fontFamily: "opensans-regular",
                },
                headerStyle: {
                  backgroundColor: design.colors.purple08,
                },
                title: translate("bodyMassIndex"),
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="ios-analytics" size={24} color={color} /> // Set size to 24 and color to blue
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerTitleStyle: {
                  color: design.colors.headerTitleColor,
                  fontFamily: "opensans-regular",
                },
                headerStyle: {
                  backgroundColor: design.colors.purple08,
                },
                title: translate("profile"),
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="ios-person" size={24} color={color} /> // Set size to 24 and color to blue
                ),
              }}
            />
          </Tab.Navigator>
        ) : (
          //  <TodaysWeight visible={shouldShowWeightPopup} setShowModal={setShouldShowWeightPopup}/>

          <WeightTracker setIsModalView={setShouldShowWeightPopup} />
        )}
      </NavigationContainer>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
