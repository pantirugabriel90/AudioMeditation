import React, { useState, useEffect, useRef } from "react";
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
import * as KeepAwake from "expo-keep-awake";
import { Audio } from "expo-av";
import {
  saveSelectedImage,
  loadSelectedImage,
  getBackgroundImage,
} from "../Utils/BackgroundUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as design from "./common/styles";
const Repeat = () => {
  const [backgroundColor, setBackgroundColor] = useState("black");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  const [inputText, setInputText] = useState("");
  const [tempSpeechRate, setTempSpeechRate] = useState("1.0");
  const [spokenText, setSpokenText] = useState("");
  const [delayRepeat, setDelayRepeat] = useState(5);
  const [speechRate, setSpeechRate] = useState(1.0);
  useEffect(() => {
    const loadValues = async () => {
      try {
        const savedText = await AsyncStorage.getItem("inputText");
        const savedDelay = await AsyncStorage.getItem("delayRepeat");
        const savedRate = await AsyncStorage.getItem("speechRate");
        console.log("loading  speech rate majestically: " + savedRate);

        setInputText(savedText || "");
        setDelayRepeat(parseFloat(savedDelay) || 5);
        setSpeechRate(parseFloat(savedRate) || 1.0);
        setTempSpeechRate(parseFloat(savedRate) || 1.0);
      } catch (error) {
        console.log("Error loading data from AsyncStorage:", error);
      }
    };

    loadValues();
  }, []);
  useEffect(() => {
    const saveValues = async () => {
      try {
        await AsyncStorage.setItem("inputText", inputText);
        await AsyncStorage.setItem("delayRepeat", delayRepeat.toString());
        await AsyncStorage.setItem("speechRate", speechRate.toString());
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error);
      }
    };

    saveValues();
  }, [inputText, delayRepeat, speechRate]);
  useFocusEffect(() => {
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });
  const requestWakeLock = async () => {
    try {
      await KeepAwake.activateKeepAwakeAsync("");
      console.log("Wake lock acquired");
    } catch (err) {
      console.error("Error acquiring wake lock:", err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      await KeepAwake.deactivateKeepAwake("");
      console.log("Wake lock released");
    } catch (err) {
      console.error("Error releasing wake lock:", err);
    }
  };
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        // allowsRecordingIOS: false,
        // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        // playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 2, // InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (ex) {
      console.log(ex);
    }
  };
  const intervalIdRef = useRef(null);

  useEffect(() => {
    if (isSpeaking) {
    } else {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, [isSpeaking]);
  useEffect(() => {
    if (isSpeaking) {
      speakInLoop();
    }
  }, [isSpeaking]);
  const speakText = async () => {
    if (inputText.trim() !== "") {
      await requestWakeLock();
      setSpokenText(inputText);
      setIsSpeaking(true);
      await speakInLoop();
    } else console.log("no text");
  };

  const speakInLoop = async () => {
    console.log("isSpeaking" + isSpeaking);
    if (isSpeaking) {
      await setupAudio(); // Ensure audio is set up for background playback
      await Speech.speak(spokenText, {
        rate: speechRate,
        onDone: () => {
          // onDone callback can be used for additional logic after speech finishes, but not for stopping currently
        },
      });
      if (isSpeaking) {
        // **Change:** Use setTimeout with intervalIdRef
        intervalIdRef.current = setTimeout(async () => {
          await speakInLoop();
        }, delayRepeat * 1000);
      }
    }
  };
  const stopSpeaking = async () => {
    try {
      console.log(isSpeaking);
      setIsSpeaking(false);

      console.log(isSpeaking);
      await Speech.stop();
      await releaseWakeLock();
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  const changeBackgroundColor = () => {
    setBackgroundColor((prevColor) =>
      prevColor === "#ff9900" ? "#00ff00" : "#ff9900"
    );
  };
  const saveDelay = async (delay) => {
    try {
      if (!/^\d*\.?\d*$/.test(delay)) return;
      var result = parseFloat(delay);
      setDelayRepeat(result ? result : 0);
    } catch (error) {
      console.error("Error saving delay settings:", error);
    }
  };
  return (
    <ImageBackground
      source={design.backgroundImage}
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
            value={tempSpeechRate.toString()}
            onChangeText={(text) => setTempSpeechRate(text)}
            onEndEditing={() => {
              const rate = parseFloat(tempSpeechRate);
              if (rate >= 0 && rate <= 2) {
                setSpeechRate(rate);
              } else {
                setTempSpeechRate(speechRate.toString());
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
            isSpeaking
              ? styles.stopButton
              : inputText
              ? styles.greenButton
              : styles.addButton,
          ]}
          disabled={!inputText}
          onPress={isSpeaking ? stopSpeaking : speakText}
        >
          <Text style={styles.addButtonText}>
            {isSpeaking ? "Stop Speaking" : "Text to Speech"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: design.colors.buttonBackgroundColor,
    padding: 10,
    height: 50,
    borderRadius: 8,
    marginLeft: 10,
    marginTop: 3,
    marginBottom: 10,
  },
  addButtonText: {
    color: design.colors.buttonTextColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  greenButton: {
    backgroundColor: "#00e500",
  },
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
