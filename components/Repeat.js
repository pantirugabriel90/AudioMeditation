import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TextInput,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import * as KeepAwake from "expo-keep-awake";
import { Audio } from "expo-av";
import * as Progress from "react-native-progress";
import {
  translate,
  getLocalLanguage,
  translateToLanguage,
} from "./multilanguage/languageService"; // Adjust the import path as necessary
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

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputText, setInputText] = useState("");

  const [localLanguageSupported, setLocalLanguageSupported] = useState(true);
  const [tempSpeechRate, setTempSpeechRate] = useState("1.0");
  const [spokenText, setSpokenText] = useState("");
  const [progress, setProgress] = useState(0);
  const interval = useRef(null); // Create useRef for interval ID
  const [delayRepeat, setDelayRepeat] = useState(5);
  const [speechRate, setSpeechRate] = useState(1.0);

  const [mantras, setMantras] = useState([
    "mantra1",
    "mantra2",
    "mantra4",
    "mantra5",
  ]);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const calculateProgress = () => {
    const delayInSeconds = parseInt(delayRepeat);

    const startTime = Date.now();
    if (interval.Current) clearInterval(interval.Current);
    interval.Current = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(interval.Current);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      const pr = Math.min(elapsed / delayInSeconds, 1);
      setProgress(pr);
      // console.log("update progress", pr + isPlayingg);
      if (elapsed >= delayInSeconds) {
        setProgress(0);
        calculateProgress();
      }
    }, 1000); // Adjust interval time to update more frequently
  };
  useEffect(() => {
    if (isSpeaking) {
      calculateProgress();
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval.Current);
  }, [isSpeaking, delayRepeat]);
  useEffect(() => {
    const loadValues = async () => {
      try {
        const savedText = await AsyncStorage.getItem("inputText");
        const savedMantrasString = await AsyncStorage.getItem("mantras");
        const savedDelay = await AsyncStorage.getItem("delayRepeat");
        const savedRate = await AsyncStorage.getItem("speechRate");
        console.log("loading  speech rate majestically: " + savedRate);
        const savedMantras = savedMantrasString
          ? JSON.parse(savedMantrasString)
          : null;
        setInputText(savedText || "");
        setMantras(savedMantras || mantras);
        setDelayRepeat(parseFloat(savedDelay) || 5);
        setSpeechRate(parseFloat(savedRate) || 1.0);
        setTempSpeechRate(parseFloat(savedRate) || 1.0);
      } catch (error) {
        console.log("Error loading data from AsyncStorage:", error);
      }
    };
    const getAvailableLanguages = async () => {
      try {
        await Localization.getLocalizationAsync(); // Wait for localization to initialize
        const availableOptions = await Speech.getAvailableVoicesAsync();

        if (Array.isArray(availableOptions)) {
          const localLanguage = await getLocalLanguage();
          console.log(availableOptions);
          console.log(localLanguage);
          const languageSupported = availableOptions.some((voice) =>
            voice.language.startsWith(localLanguage)
          );

          setLocalLanguageSupported(languageSupported);

          console.log("ce masa " + languageSupported);
        } else {
          console.log("local language reading error.");

          setLocalLanguageSupported(false);
        }
      } catch (error) {
        console.log("Exception local language reading error.");
      }
    };
    getAvailableLanguages();
    loadValues();
  }, []);
  useEffect(() => {
    const saveValues = async () => {
      try {
        await AsyncStorage.setItem("inputText", inputText);

        const mantrasString = JSON.stringify(mantras);
        await AsyncStorage.setItem("mantras", mantrasString);
        await AsyncStorage.setItem("delayRepeat", delayRepeat.toString());
        await AsyncStorage.setItem("speechRate", speechRate.toString());
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error);
      }
    };

    saveValues();
  }, [inputText, delayRepeat, speechRate, mantras]);
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
      var localLanguage = await getLocalLanguage();
      await setupAudio(); // Ensure audio is set up for background playback
      await Speech.speak(spokenText, {
        rate: speechRate,
        language: localLanguage,
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
  const handleMantraClick = (mantra) => {
    setInputText(mantra);
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
  const conditionalTranslate = (text) => {
    if (localLanguageSupported) return translate(text);
    return translateToLanguage(text, "en");
  };
  const handleSave = async () => {
    const updatedMantras = [...mantras];
    updatedMantras.push(inputText);
    setMantras(updatedMantras);
  };
  const handleClearTextBox = async () => {
    setInputText("");
  };
  const handleDeleteMantra = async (index) => {
    const updatedMantras = [...mantras];
    updatedMantras.splice(index, 1);
    setMantras(updatedMantras);

    // const updatedMantrasString = JSON.stringify(updatedMantras);
    // await AsyncStorage.setItem("savedMantras", updatedMantrasString);
  };
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.slice(0, maxLength) + "..."; // Add '...' to indicate truncation
    }
    return text;
  };

  return (
    <ImageBackground
      source={design.backgroundImage}
      style={[styles.background, { backgroundColor }]}
      resizeMode="cover"
    >
      {!isKeyboardVisible && (
        <View>
          <View style={styles.mantraContainer}>
            {mantras.map((mantra, index) => (
              <TouchableOpacity
                key={index}
                style={styles.mantraButton}
                onPress={() => handleMantraClick(conditionalTranslate(mantra))}
              >
                <Icon name="arrow-bottom-right" style={styles.arrowIcon} />
                <Text style={styles.mantraText}>
                  {truncateText(conditionalTranslate(mantra), 35)}
                </Text>

                <TouchableOpacity
                  style={styles.deleteMantraContainer}
                  onPress={() => handleDeleteMantra(index)}
                >
                  <Icon name="delete-forever" style={styles.deleteIcon} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          {!localLanguageSupported && (
            <Text style={styles.warningText}>
              {translate("localLanguageWarning")}
            </Text>
          )}
        </View>
      )}
      <View style={styles.textBoxContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          multiline
          onChangeText={(text) => setInputText(text)}
          placeholder="Enter text"
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.subContainer}
            onPress={() => handleClearTextBox()}
          >
            <Icon name="delete-forever" style={styles.deleteIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subContainer}
            onPress={() => handleSave()}
          >
            <Icon name="plus" style={styles.addIcon} />
          </TouchableOpacity>
        </View>
      </View>
      {!isKeyboardVisible && (
        <View style={styles.progressBarContainer}>
          <Progress.Bar
            progress={progress}
            width={300}
            height={20}
            color="#00e500"
            borderWidth={2}
            borderColor={design.colors.purple08} // Outline color
            unfilledColor={design.colors.purple08} // The background color of the unfilled portion
          />
        </View>
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{translate("delayInSeconds")}</Text>
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
        <Text style={styles.label}>{translate("speechRate")}</Text>
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
          {inputText &&
            (!isSpeaking ? (
              <Icon name="play-box" style={styles.playIcon} />
            ) : (
              <Icon name="stop-circle-outline" style={styles.stopIcon} />
            ))}
          <Text style={styles.addButtonText}>
            {isSpeaking ? translate("stopSpeaking") : translate("textToSpeech")}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "column", // Stack buttons vertically
    alignItems: "center", // Center buttons horizontally within the container
    marginTop: 20,
  },
  addIcon: {
    fontSize: 24,
    color: "green", // Adjust color as needed
  },
  textInput: {
    width: "80%",
    borderColor: "white",
    borderWidth: 1,
    marginTop: "10%",
    color: "purple",
    marginBottom: 15,
    height: "60%",
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
  },
  textBoxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    height: "25%",
    alignItems: "center",
    width: "100%",
  },
  deleteIcon: {
    fontSize: 20,
    color: "red",
  },
  subContainer: {
    backgroundColor: "white",
    borderRadius: 7,
    padding: 8,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    marginLeft: 10,
  },
  deleteMantraContainer: {
    backgroundColor: "white",
    borderRadius: 7,
    padding: 1,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    marginLeft: 10,
  },
  mantraContainer: {
    backgroundColor: design.colors.purple08,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: -20,
  },
  warningText: {
    color: "red",
    fontSize: 14,
    backgroundColor: design.colors.purple08,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: -15,
    textAlign: "center",
  },
  mantraButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    flexDirection: "row",
    marginVertical: 3,
    borderRadius: 5,
  },
  mantraText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline", // This makes the text underlined
  },
  arrowIcon: {
    fontSize: 24,
    color: "rgba(0, 229, 0, 0.8)",
    marginRight: 10,
    marginLeft: -10,
  },
  progressBarContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
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
    marginBottom: 3,
    fontWeight: "bold",
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
    marginBottom: -10,
    color: "white",
    fontWeight: "bold",
  },
  inputWrapper: {
    width: "20%",
    minWidth: 200,
  },
  playIcon: {
    fontSize: 24,
    color: design.colors.purple1,
    marginRight: 10,
  },
  stopIcon: {
    fontSize: 24,
    color: "rgba(0, 229, 0, 0.8)",
    marginRight: 10,
  },
  greenButton: {
    backgroundColor: "rgba(0, 229, 0, 0.8)",
  },
  stopButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
  },
  button: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  textToSpeechButton: {
    backgroundColor: "#0077cc",
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
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
  },
});

export default Repeat;
