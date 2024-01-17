import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import {
  saveSelectedImage,
  loadSelectedImage,
  getBackgroundImage,
} from "../Utils/BackgroundUtils";
const SecondScreen = ({ sound }) => {
  const [backgroundColor, setBackgroundColor] = useState("#ff9900");
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );
  useFocusEffect(() => {
    // Load the selected image path from local storage when component mounts
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });

  const startRepeat = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        await sound.replayAsync();
      }
    } catch (error) {
      console.error("Error starting repeat:", error);
    }
  };

  const changeBackgroundColor = () => {
    // Implement your logic to change the background color
    // For simplicity, let's toggle between two colors
    setBackgroundColor((prevColor) =>
      prevColor === "#ff9900" ? "#00ff00" : "#ff9900"
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { backgroundColor }]}
      resizeMode="cover"
    >
      <View>
        <TouchableOpacity
          style={[styles.button, styles.repeatButton]}
          onPress={startRepeat}
        >
          <Text style={styles.buttonText}>Asculta pe Repeat</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  repeatButton: {
    backgroundColor: "#ff9900",
  },
  settingsButton: {
    backgroundColor: "#0077cc", // Adjust the color as needed
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SecondScreen;
