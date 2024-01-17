import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveSelectedImage,
  loadSelectedImage,
  getBackgroundImage,
} from "../Utils/BackgroundUtils";

import { useFocusEffect } from "@react-navigation/native";
const Settings = ({ sound }) => {
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Load the selected image path from local storage when component mounts
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setSelectedImage(storedImage);
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  }, []);

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

  const changeBackgroundColor = (imageNumber) => {
    // Set the selected image and save it to local storage
    setSelectedImage(imageNumber);
    setBackgroundImage(getBackgroundImage(imageNumber));
    saveSelectedImage(imageNumber);
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.radioGroup}>
        {[1, 2, 3, 4, 5].map((imageNumber) => (
          <View key={imageNumber} style={styles.radioButtonContainer}>
            <RadioButton
              value={imageNumber}
              status={selectedImage === imageNumber ? "checked" : "unchecked"}
              onPress={() => changeBackgroundColor(imageNumber)}
            />

            <Text style={styles.radioButtonText}>{`Image ${imageNumber}`}</Text>

            <Image
              source={getBackgroundImage(imageNumber)}
              style={styles.icon}
            />
          </View>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 100,
    height: 60,
    marginRight: 10, // Adjust as needed
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  repeatButton: {
    backgroundColor: "#ff9900",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  radioGroup: {
    flexDirection: "column",
    marginTop: 10,
    alignItems: "flex-start",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButtonText: {
    marginLeft: 5,
  },
});

export default Settings;
