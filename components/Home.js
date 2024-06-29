import React, { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { translate } from "./multilanguage/languageService"; // Adjust the import path as necessary

import { ProgressBar } from "@react-native-community/progress-bar-android";
import * as Progress from "react-native-progress";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import commonStyles from "./CommonStyles";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";
import {
  saveSelectedImage,
  loadSelectedImage,
  getBackgroundImage,
} from "../Utils/BackgroundUtils";

import * as design from "./common/styles";
import * as KeepAwake from "expo-keep-awake";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
const windowWidth = Dimensions.get("window").width; // Get screen width

const HomeScreen = () => {
  const [selectedRecordingIndex, setSelectedRecordingIndex] = useState(null);
  const [recording, setRecording] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [sound, setSound] = useState();
  const [isPlayingg, setIsPlayingg] = useState(false);
  const [recordingToBeSaved, setRecordingToBeSaved] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("5");
  const [delayUnit, setDelayUnit] = useState("seconds");
  const [recordingsList, setRecordingsList] = useState([]);
  const [recordingName, setRecordingName] = useState("");
  const intervalIdRef = useRef(null); // Create useRef for interval ID
  const interval = useRef(null); // Create useRef for interval ID

  const [progress, setProgress] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [intervalIdTimer, setIntervalIdTimer] = useState(null);

  useEffect(() => {
    if (recording) {
      const id = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      setIntervalIdTimer(id);
    } else if (!recording && intervalIdTimer) {
      clearInterval(intervalIdTimer);
      setIntervalIdTimer(null);
    }

    return () => {
      if (intervalIdTimer) {
        clearInterval(intervalIdTimer);
      }
    };
  }, [recording, startTime]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const calculateProgress = () => {
    const delayInSeconds =
      delayUnit === "seconds"
        ? parseInt(repeatDelay)
        : parseInt(repeatDelay) * 60;

    const startTime = Date.now();
    if (interval.Current) clearInterval(interval.Current);
    interval.Current = setInterval(() => {
      if (!isPlayingg) {
        clearInterval(interval.Current);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      const pr = Math.min(elapsed / delayInSeconds, 1);
      setProgress(pr);
      setProgress2(pr);
      // console.log("update progress", pr + isPlayingg);np
      if (elapsed >= delayInSeconds) {
        setProgress(0);
        calculateProgress();
      }
    }, 1000); // Adjust interval time to update more frequently
  };
  useEffect(() => {
    if (isPlayingg) {
      calculateProgress();
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval.Current);
  }, [isPlayingg, repeatDelay, delayUnit]);
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
  useEffect(() => {
    requestDiskPermissions();
    loadLocalData();
  }, []);
  useFocusEffect(() => {
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });
  useEffect(() => {
    const playAudio = async () => {
      console.log("playAudio1" + isPlayingg);
      if (isPlayingg) {
        console.log("playAudio is Playing and selected Recording Index");

        clearInterval(intervalIdRef.current);
        await togglePlay(selectedRecordingIndex);
      } else {
        console.log(
          "playAudio clearing interval " +
            isPlayingg +
            " " +
            selectedRecordingIndex
        );
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
    playAudio();
    return () => clearInterval(intervalIdRef.current);
  }, [isPlayingg]);
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        shouldDuckAndroid: true,
        interruptionModeAndroid: 2, // InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (ex) {
      console.log(ex);
    }
  };
  const requestWakeLock = async () => {
    try {
      await KeepAwake.activateKeepAwakeAsync("");
      // await Audio.setAudioModeAsync({
      //   staysActiveInBackground: true,
      //   shouldDuckAndroid: true,
      //   playThroughEarpieceAndroid: true,
      //   allowsRecordingIOS: true,
      //   playsInSilentModeIOS: true,
      // });
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
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const toggleRecording = async () => {
    try {
      setRecordingToBeSaved(true);
      // alert("bfore calling requestPermissions");
      //await requestMicrophonePermissions();  try {
      console.log("Requesting permissions..");

      const AudioPerm = await Audio.requestPermissionsAsync();
      if (AudioPerm.status === "granted") {
        // alert("Audio Permission Granted");
      } else {
        alert(
          "audio permisions not granted. status received: " + AudioPerm.status
        );
        return;
      }
    } catch (error) {
      alert("error while requesting permisisons   " + error.message);
    }
    try {
      await stopSound();
      if (recording) {
        //stop recording

        await recording.stopAndUnloadAsync();
        const { sound } = await recording.createNewLoadedSoundAsync(
          {},
          (status) => {
            if (status.didJustFinish) {
              const delayInSeconds =
                delayUnit === "seconds"
                  ? parseInt(repeatDelay)
                  : parseInt(repeatDelay) * 60;
              setTimeout(() => {
                sound.replayAsync();
              }, delayInSeconds * 1000);
            }
          }
        );
        setSound(sound);
        setTemporary(recording);
        setRecording(null);
      } else {
        //start recording

        setStartTime(Date.now());
        const recordingObj = new Audio.Recording();
        await recordingObj.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recordingObj.startAsync();
        setRecording(recordingObj);
      }
    } catch (error) {
      alert(error.message);
      console.log("error while starting the recording: ");
      console.error("Error while starting the recording:", error);
    }
  };
  const toggleStop = async () => {
    if (isPlayingg) {
      await releaseWakeLock();
      await stopSound();
    }
  };
  const togglePlay = async (recordIndex, stop) => {
    try {
      var shouldPlay = isPlayingg;
      console.log("isPlaying" + isPlayingg);
      await setupAudio(); // Ensure audio is set up for background playback

      shouldPlay = true;
      if (typeof recordIndex === "number") {
        await requestWakeLock();
        console.log("recordIndex  " + JSON.stringify(recordIndex));
        const selectedRecording = recordingsList[recordIndex];
        console.log(
          "test" +
            selectedRecording.fileUri +
            " " +
            selectedRecording.name +
            " " +
            recordIndex
        );

        var first = true;
        const { sound } = await Audio.Sound.createAsync(
          { uri: selectedRecording.fileUri },
          {},
          (status) => {
            console.log(
              "f11inished playing song " +
                delayUnit +
                "  is playing " +
                isPlayingg +
                " first" +
                first
              //   + JSON.stringify(status)
            );
            if (isPlayingg || first) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
              first = false;

              console.log(
                "finished playing song after if " +
                  delayUnit +
                  "  isPlaying " +
                  isPlayingg
              );
              const delayInSeconds =
                delayUnit === "seconds"
                  ? parseInt(repeatDelay)
                  : parseInt(repeatDelay) * 60;
              intervalIdRef.current = setTimeout(() => {
                sound.replayAsync();
              }, delayInSeconds * 1000);
            }
          }
        );
        setSound(sound);
        //await togglePlay(recordIndex, again);
        await sound.replayAsync();
      } else {
        //  if (sound) await sound.replayAsync();
      }
      //   }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlayingg(false);
      }
    } catch (error) {
      console.log("Error stopping sound:", error);

      setIsPlayingg(false);
    }
  };

  const memorizeRecording = async () => {
    try {
      if (temporary) {
        if (!recordingName.trim()) {
          alert("Please enter a name for the recording.");
          return;
        }
        const uri = await temporary.getURI();

        const fileUri = `${FileSystem.documentDirectory}${recordingName}.wav`;
        await FileSystem.moveAsync({ from: uri, to: fileUri });
        const recordingObject = { name: recordingName, fileUri };

        setRecordingsList((prevList) => [...prevList, recordingObject]);

        await AsyncStorage.setItem(
          "memorizedRecords",
          JSON.stringify([...recordingsList, recordingObject])
        );

        setRecordingName("");

        setElapsedTime(0);
        setStartTime(null);
        setRecordingToBeSaved(false);
      } else {
        console.log("recording is null");
      }
    } catch (error) {
      console.error("Error memorizing recording:", error);
    }
  };

  const handleDeleteRecording = async (index) => {
    const updatedRecordings = [...recordingsList];
    updatedRecordings.splice(index, 1);
    setRecordingsList(updatedRecordings);
    setSelectedRecordingIndex(null);

    const updatedRecordsString = JSON.stringify(updatedRecordings);
    await AsyncStorage.setItem("memorizedRecords", updatedRecordsString);
  };
  const saveDelay = async (delay, unit) => {
    try {
      if (!/^\d*\.?\d*$/.test(delay)) return;
      var turnBackOn = false;
      if (isPlayingg) {
        turnBackOn = true;
        setIsPlayingg(false);
      }
      setRepeatDelay(delay);
      var savedUnit =
        unit === "minutes" || unit === "seconds" ? unit : delayUnit;
      var delaySettings = JSON.stringify({ delay, savedUnit });

      console.log("delay" + delaySettings);

      if (delay) await AsyncStorage.setItem("delaySettings", delaySettings);
      if (turnBackOn) setIsPlayingg(true);
    } catch (error) {
      console.error("Error saving delay settings:", error);
    }
  };

  const loadLocalData = async () => {
    try {
      await stopSound();
      if (sound) await sound.stopAsync();
      const readStoragePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      await loadDelaySettings();
      if (!readStoragePermission) {
        console.log("Permissions for reading external storage not granted.");
        return;
      }
      const storedRecordings = await AsyncStorage.getItem("memorizedRecords");

      if (storedRecordings) {
        const recordings = JSON.parse(storedRecordings);
        setRecordingsList(recordings);

        if (recordings.length > 0) {
          const lastRecording = recordings[recordings.length - 1];
          const { sound } = await Audio.Sound.createAsync(
            { uri: lastRecording.fileUri },
            {},
            (status) => {
              if (status.didJustFinish) {
                const delayInSeconds =
                  delayUnit === "seconds"
                    ? parseInt(repeatDelay)
                    : parseInt(repeatDelay) * 60;
                setTimeout(() => {
                  sound.replayAsync();
                }, delayInSeconds * 1000);
              }
            }
          );
          setSound(sound);
        }
      }
    } catch (error) {
      console.log("Error loading memorized recordings:", error);
    }
  };
  const loadDelaySettings = async () => {
    try {
      const savedSettingsString = await AsyncStorage.getItem("delaySettings");

      // Parse saved settings (handle potential parsing errors)
      let savedSettings = {};
      try {
        savedSettings = JSON.parse(savedSettingsString) || {};
      } catch (error) {
        console.error("Error parsing saved delay settings:", error);
      }

      setRepeatDelay(savedSettings.delay || "5"); // Set default to 5
      setDelayUnit(savedSettings.savedUnit || "seconds"); // Set default to "seconds"
    } catch (error) {
      console.error("Error loading delay settings from AsyncStorage:", error);
    }
  };

  const requestDiskPermissions = async () => {
    let logMessage = ""; // To store log messages
    try {
      if (Platform.OS === "android") {
        const readStoragePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        logMessage += `Read storage permission: ${readStoragePermission}\n`; // Log read storage permission result

        const writeStoragePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        logMessage += `Write storage permission: ${writeStoragePermission}\n`; // Log write storage permission result

        if (
          readStoragePermission !== PermissionsAndroid.RESULTS.GRANTED ||
          writeStoragePermission !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("Disk permissions not granted");
          alert("Disk permissions not granted:\n" + logMessage); // Display all permission results in an alert
          return;
        }
      } else {
        // Handle disk permissions for iOS if needed
      }

      console.log("Disk permissions granted successfully");
    } catch (error) {
      alert(error.message);
      alert("Disk permissions not granted:\n" + logMessage); // Display all permission results in an alert
      console.error("Error requesting disk permissions:", error);
    }
  };

  return (
    <ImageBackground
      source={design.backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {recordingToBeSaved && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.addButton,
              !recording && styles.greenButton,
              recording && styles.redButton,
            ]}
            onPress={toggleRecording}
          >
            <Text style={styles.addButtonText}>
              {recording ? translate("Stop Recording") : translate("Record")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addButton,
              styles.playButton,
              selectedRecordingIndex === null && styles.disabledButton,
              isPlayingg && styles.redButton,
            ]}
            onPress={() => {
              if (isPlayingg) {
                setIsPlayingg(false);
              } else {
                setIsPlayingg(true);
                // togglePlay(selectedRecordingIndex);
              }
            }}
            disabled={selectedRecordingIndex === null}
          >
            <Text style={styles.addButtonText}>
              {isPlayingg ? translate("Stop") : translate("Play")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, recordingName && styles.greenButton]}
            onPress={memorizeRecording}
            disabled={!recordingName}
          >
            <Text style={[styles.addButtonText]}>
              {translate("Save Recording")}
            </Text>
          </TouchableOpacity>
        </View>
        {
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
        }
        {recordingToBeSaved && (
          <TextInput
            style={styles.input}
            placeholder="Enter recording name"
            value={recordingName}
            maxLength={25}
            onChangeText={(text) => setRecordingName(text)}
          />
        )}
        <View style={styles.delayContainer}>
          <Text style={styles.label}>{translate("Replay delay")}:</Text>
          <TextInput
            style={styles.numberInput}
            value={repeatDelay}
            onChangeText={(text) => {
              saveDelay(text);
            }}
            keyboardType="numeric"
          />

          <View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="minutes"
                status={delayUnit === "minutes" ? "checked" : "unchecked"}
                onPress={async () => {
                  setDelayUnit("minutes");
                  saveDelay(repeatDelay, "minutes");
                }}
                color={design.colors.buttonBackgroundColor}
              />
              <Text style={styles.radioButtonLabel}>
                {translate("Minutes")}
              </Text>
            </View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="seconds"
                status={delayUnit === "seconds" ? "checked" : "unchecked"}
                onPress={() => {
                  setDelayUnit("seconds");

                  saveDelay(repeatDelay, "seconds");
                }}
                color={design.colors.buttonBackgroundColor}
              />
              <Text style={styles.radioButtonLabel}>
                {translate("Seconds")}
              </Text>
            </View>
          </View>
        </View>

        {!isKeyboardVisible && (
          <View style={styles.recordingsListContainer}>
            <View style={styles.centeredContainer}>
              <Text style={[styles.addButtonText, { fontSize: 22 }]}>
                {translate("Mantras")}:
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {recordingsList.map((recording, index) => (
                <View
                  key={index}
                  style={[
                    index % 2 === 1
                      ? styles.lightBackground
                      : styles.darkBackground,
                  ]}
                >
                  <View style={[styles.mainContainer]}>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          if (
                            selectedRecordingIndex == index &&
                            isPlayingg == true
                          ) {
                            setIsPlayingg(false);
                            return;
                          }
                          setIsPlayingg(true);
                          setSelectedRecordingIndex(index); // Set the selected index
                          console.log(
                            "on pressssss " +
                              index +
                              "oooo " +
                              selectedRecordingIndex +
                              "  ooo   " +
                              isPlayingg
                          );
                        } catch (error) {
                          console.error("Error in onPress:", error); // Handle other errors
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.recordingItemContainer,
                          selectedRecordingIndex === index &&
                            styles.selectedRecording,
                        ]}
                      >
                        {isPlayingg && selectedRecordingIndex === index ? (
                          <Icon
                            name="stop-circle-outline"
                            style={styles.stopIcon}
                          />
                        ) : (
                          <Icon name="play-box" style={styles.playIcon} />
                        )}
                        <Text style={styles.recordingItem}>
                          {recording.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subContainer}
                      onPress={() => handleDeleteRecording(index)}
                    >
                      <Icon name="delete-forever" style={styles.deleteIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {Array.from({
                length: Math.max(7 - recordingsList.length, 0),
              }).map((_, index) => (
                <View
                  key={`empty-${index}`}
                  style={[
                    (recordingsList.length + index) % 2 === 0
                      ? styles.lightBackground
                      : styles.darkBackground,
                    styles.rowContainer,
                  ]}
                >
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {translate("Add your recording here...")}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  timerContainer: { marginTop: -25 },
  timerText: {
    fontWeight: "bold",
  },
  progressBarContainer: {
    width: "80%",
  },
  centeredContainer: {
    alignItems: "center",
  },
  emptyContainer: {
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth * 0.75,
  },
  emptyText: {
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
  },
  lightBackground: {
    // backgroundColor: "rgba(17, 40, 120, 0.5)",

    backgroundColor: "rgba(17, 40, 120, 0.5)",
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 10,
    paddingBottom: 3,
    marginTop: 3,
  },
  darkBackground: {
    backgroundColor: "rgba(17, 40, 120, 0.5)",
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 10,
    marginTop: 3,
    paddingBottom: 5,
  },
  recordingsListContainer: {
    backgroundColor: "rgba(17, 40, 120, 0.5)",
    minHeight: "60%",
    maxHeight: "63%",
    padding: 10,
    minWidth: "100%",
    paddingBottom: 25,
    marginBottom: -30,
    borderRadius: 10,
  },
  recordingItemContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5, // Adjust spacing for vertical alignment
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 5,
    marginTop: 5,
    width: windowWidth * 0.65,
  },
  recordingsListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "pink",
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
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    width: windowWidth * 0.75,
  },
  deleteIcon: {
    fontSize: 20,
    color: "red",
  },
  playIcon: {
    fontSize: 24,
    color: "#00e500",
    marginRight: 10,
  },
  stopIcon: {
    fontSize: 24,
    color: "red",
    marginRight: 10,
  },
  container: {
    flex: 1,
  },
  background: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    flex: 1,
    justifyContent: "space-around",
  },
  addButton: {
    backgroundColor: design.colors.buttonBackgroundColor,
    padding: 10,
    height: 50,
    borderRadius: 8,
    marginLeft: 20,
    marginRight: 20,
  },
  greenButton: {
    backgroundColor: "#00e500",
  },
  redButton: {
    backgroundColor: "red",
  },
  addButtonText: {
    color: design.colors.buttonTextColor,
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "pink",
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
    padding: 10,
  },
  disabledButton: {
    backgroundColor: design.colors.buttonBackgroundColor,
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
  radioButtonLabel: {
    marginLeft: 5,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 5,
    color: "purple", // Adjust the color according to your design
  },
  selectedRecording: {
    backgroundColor: "lightblue", // Customize the background color for the selected recording
  },
  style: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    textAlign: "center", // Add this line
  },
  buttonRow: {
    flexDirection: "row",
    width: windowWidth,
    paddingRight: -50,
    paddingLeft: -50,
    justifyContent: "space-around", // You can also use 'space-between' or 'space-evenly'
  },

  statusText: {
    fontSize: 25,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 10,
  },
  enterButton: {
    backgroundColor: "#ffcc00",
  },
  playButton: {
    backgroundColor: "#00e500",
  },
  memorizeButton: {
    backgroundColor: "#ff00ff",
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "#ffcc00",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "left",
    flexDirection: "row",
  },
  delayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 5,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  radioButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#cccccc",
  },
  radioButtonSelected: {
    backgroundColor: "#ffcc00",
  },
  recordingItem: {
    marginRight: 10,
    fontSize: 16,
    marginBottom: 5,
    color: design.colors.purple1,
  },

  replaceIcon: {
    color: "blue", // Customize the color for the replacement icon
    fontSize: 20,
    marginLeft: 10, // Adjust spacing between delete and replace icons
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginRight: 10,
    color: "white",
    fontWeight: "bold",
  },
  inputWrapper: {
    width: "20%",
    minWidth: 200,
  },
});

export default HomeScreen;
