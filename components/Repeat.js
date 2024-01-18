import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
} from "react-native";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import {
  saveSelectedImage,
  loadSelectedImage,
  getBackgroundImage,
} from "../Utils/BackgroundUtils";
const Repeat = ({ sound }) => {
  const [backgroundColor, setBackgroundColor] = useState("black");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  const [inputText, setInputText] = useState("");
  useFocusEffect(() => {
    // Load the selected image path from local storage when component mounts
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });

  const speakText = () => {
    if (inputText.trim() !== "") {
      setIsSpeaking(true);
      repeatInterval = setInterval(() => {
        Speech.speak(inputText, { rate: 1 }); // Adjust the rate as needed
      }, 0); // Repeat every 5 seconds, adjust as needed
    }
  };

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
  const stopSpeaking = () => {
    setIsSpeaking(false);
    clearInterval(repeatInterval);
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
      <TextInput
        style={styles.textInput}
        value={inputText}
        onChangeText={(text) => setInputText(text)}
        placeholder="Enter your text here"
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            isSpeaking ? styles.stopButton : styles.textToSpeechButton,
          ]}
          onPress={isSpeaking ? stopSpeaking : speakText}
        >
          <Text style={styles.buttonText}>
            {isSpeaking ? "Stop Speaking" : "Text to Speech"}
          </Text>
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
  textToSpeechButton: {
    backgroundColor: "#0077cc",
  },
  stopButton: {
    backgroundColor: "#ff0000",
  },
  repeatButton: {
    backgroundColor: "#ff9900",
  },
  settingsButton: {
    backgroundColor: "#0077cc", // Adjust the color as needed
  },
  buttonText: {
    color: "purple",
    fontWeight: "bold",
    textAlign: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textInput: {
    width: "70%",
    height: "25%",
    borderColor: "white",
    borderWidth: 1,
    marginTop: "10%",
    color: "purple",
    marginBottom: 30,
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
  },
});

export default Repeat;
