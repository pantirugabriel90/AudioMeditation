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
const Repeat = () => {
  const [backgroundColor, setBackgroundColor] = useState("black");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  const [inputText, setInputText] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [delayRepeat, setDelayRepeat] = useState(5);
  const [speechRate, setSpeechRate] = useState(1.0);

  useFocusEffect(() => {
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });

  useEffect(() => {
    if (isSpeaking) {
      speakInLoop();
    }
  }, [isSpeaking]);

  const speakInLoop = async () => {
    if (isSpeaking) {
      await Speech.speak(spokenText, {
        rate: speechRate,
        onDone: () => {
          setTimeout(() => {
            speakInLoop();
          }, delayRepeat * 1000);
        },
      });
    }
  };
  const speakText = async () => {
    if (inputText.trim() !== "") {
      setSpokenText(inputText);
      setIsSpeaking(true);
      await speakInLoop();
    } else console.log("no text");
  };

  const stopSpeaking = async () => {
    try {
      console.log(isSpeaking);
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  const changeBackgroundColor = () => {
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
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Delay in seconds:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.numberInput}
            value={delayRepeat.toString()}
            onChangeText={(text) => {
              if (/^\d*\.?\d*$/.test(text)) {
                setDelayRepeat(text === "" ? "" : parseFloat(text));
              }
            }}
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Speech Rate:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.numberInput}
            value={speechRate.toString()}
            onChangeText={(text) => {
              // Ensure the entered value is a number or float between 0.25 and 2
              const rate = parseFloat(text);
              if (rate >= 0 && rate <= 2) {
                setSpeechRate(rate.toFixed(2)); // Limit to 2 decimal places
              }
            }}
            keyboardType="numeric"
          />
        </View>
      </View>
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
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    width: "80%",
    textAlign: "right",
    marginRight: 10,
    color: "white",
    fontWeight: "bold",
  },
  inputWrapper: {
    width: "20%",
    minWidth: 200,
  },
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

  numberInput: {
    width: "25%",
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
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
