import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";

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
const HomeScreen = () => {
  const [selectedRecordingIndex, setSelectedRecordingIndex] = useState(null);
  const [recording, setRecording] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("5");
  const [delayUnit, setDelayUnit] = useState("seconds");
  const [recordingsList, setRecordingsList] = useState([]);
  const [recordingName, setRecordingName] = useState("");

  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  useEffect(() => {
    requestDiskPermissions();
    loadMemorizedRecording();
  }, []);
  useFocusEffect(() => {
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });
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
  const toggleRecording = async () => {
    try {
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
      if (sound) await sound.stopAsync();
      if (recording) {
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

  const togglePlayStop = async (recordIndex) => {
    try {
      //if (sound) {
      var shouldPlay = isPlaying;
      console.log("isPlaying" + isPlaying);
      await setupAudio(); // Ensure audio is set up for background playback

      if (isPlaying) {
        setIsPlaying(false);
        await releaseWakeLock();
        await stopSound();
      } else {
        await setIsPlaying(true);
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
                "finished playing song " +
                  delayUnit +
                  "  repeatDelay " +
                  isPlaying
                //   + JSON.stringify(status)
              );
              if ((status.shouldPlay && isPlaying) || first) {
                first = false;
                console.log(
                  "finished playing song " +
                    delayUnit +
                    "  repeatDelay " +
                    repeatDelay
                );
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

          await sound.replayAsync();
        } else {
          await sound.replayAsync();
        }
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
        setIsPlaying(false);
      }
    } catch (error) {
      console.log("Error stopping sound:", error);

      setIsPlaying(false);
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
      } else {
        console.log("recording is null");
      }
    } catch (error) {
      console.error("Error memorizing recording:", error);
    }
  };

  const handleDeleteRecording = (index) => {
    const updatedRecordings = [...recordingsList];
    updatedRecordings.splice(index, 1);
    setRecordingsList(updatedRecordings);
    setSelectedRecordingIndex(null); // Clear the selected index
    // Perform any additional actions (e.g., delete the file, update storage, etc.)
    // ...
  };

  const loadMemorizedRecording = async () => {
    try {
      await stopSound();
      if (sound) await sound.stopAsync();
      const readStoragePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

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

  const replayRecording = async (specificRecording) => {
    try {
      await stopSound();
      if (sound) await sound.stopAsync();
      const delaySettings = await AsyncStorage.getItem("delaySettings");
      console.log(delaySettings);
      if (delaySettings) {
        const { repeatDelay: savedRepeatDelay, delayUnit: savedDelayUnit } =
          JSON.parse(delaySettings);

        setRepeatDelay(savedRepeatDelay);
        setDelayUnit(savedDelayUnit);
        console.log("specificRecording" + specificRecording);
        let memorizedURI = specificRecording
          ? specificRecording.fileUri
          : await AsyncStorage.getItem("memorizedRecording");

        if (memorizedURI) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: memorizedURI },
            {},
            (status) => {
              if (status.didJustFinish) {
                const delayInSeconds =
                  savedDelayUnit === "seconds"
                    ? parseInt(savedRepeatDelay)
                    : parseInt(savedRepeatDelay) * 60;
                setTimeout(() => {
                  sound.replayAsync();
                }, delayInSeconds * 1000);
              }
            }
          );

          setSound(sound);
        }
        console.log("what is here");
      }
    } catch (error) {
      console.log("Error replaying recording:", error);
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

  const requestMicrophonePermissions = async () => {
    let logMessage = ""; // To store log messages
    try {
      if (Platform.OS === "android") {
        const audioPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        logMessage += `Microphone permission for Android: ${audioPermission}\n`; // Log Android microphone permission result

        if (audioPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Microphone permission not granted for Android");
          alert("Microphone permission not granted for Android");
          return;
        }
      } else {
        const { status: microphonePermission } = await Permissions.askAsync(
          Permissions.AUDIO_RECORDING
        );
        logMessage += `Microphone permission for iOS: ${microphonePermission}\n`; // Log iOS microphone permission result

        if (microphonePermission !== "granted") {
          console.log("Microphone permission not granted for iOS");
          alert("Microphone permission not granted for iOS");
          return;
        }
      }

      console.log("Microphone permissions granted successfully");
    } catch (error) {
      alert(error.message);
      alert("Microphone permissions not granted:\n" + logMessage); // Display all permission results in an alert
      console.error("Error requesting microphone permissions:", error);
    }
  };

  // Usage:
  // Call requestDiskPermissions and requestMicrophonePermissions functions where needed in your code.

  const saveDelay = async (delay) => {
    try {
      console.log("delay" + delay);
      setRepeatDelay(delay);
      await AsyncStorage.setItem(
        "delaySettings",
        JSON.stringify({ delay, delayUnit })
      );

      replayRecording();
    } catch (error) {
      console.error("Error saving delay settings:", error);
    }
  };
  <View style={commonStyles.centerContainer}>
    <Text>Home</Text>
    {/* Your Home screen content */}
  </View>;
  return (
    <ImageBackground
      source={design.backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.addButton]}
            onPress={toggleRecording}
          >
            <Text style={styles.addButtonText}>
              {recording ? "Stop Recording" : "Record"}
            </Text>
          </TouchableOpacity>
          {/*
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={togglePlayStop}
          >
            <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Play"}</Text>
          </TouchableOpacity>
  */}
          <TouchableOpacity
            style={[styles.addButton]}
            onPress={memorizeRecording}
          >
            <Text style={styles.addButtonText}>Save Recording</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.delayContainer}>
          <Text style={styles.label}>Replay delay:</Text>
          <TextInput
            style={styles.numberInput}
            value={repeatDelay}
            onChangeText={(text) => {
              if (text && /^\d*\.?\d*$/.test(text)) {
                saveDelay(text);
              }
            }}
            keyboardType="numeric"
          />

          <View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="minutes"
                status={delayUnit === "minutes" ? "checked" : "unchecked"}
                onPress={() => setDelayUnit("minutes")}
                color={design.colors.buttonBackgroundColor}
              />
              <Text style={styles.radioButtonLabel}>Minutes</Text>
            </View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="seconds"
                status={delayUnit === "seconds" ? "checked" : "unchecked"}
                onPress={() => setDelayUnit("seconds")}
                color={design.colors.buttonBackgroundColor}
              />
              <Text style={styles.radioButtonLabel}>Seconds</Text>
            </View>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter recording name"
          value={recordingName}
          onChangeText={(text) => setRecordingName(text)}
        />
        <View style={styles.recordingsListContainer}>
          <Text style={[styles.addButtonText, { fontSize: 22 }]}>
            Recordings List:
          </Text>
          {recordingsList.map((recording, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                setSelectedRecordingIndex(index);
                await togglePlayStop(index);
              }}
            >
              <View
                style={[
                  styles.recordingItemContainer,
                  selectedRecordingIndex === index && styles.selectedRecording,
                ]}
              >
                <Text style={styles.recordingItem}>{recording.name}</Text>

                <Icon
                  name="delete-forever"
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteRecording(index)}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  },
  addButtonText: {
    color: design.colors.buttonTextColor,
    fontSize: 16,
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
  recordButton: {
    backgroundColor: "#ff0000",
  },
  playButton: {
    backgroundColor: "#00ff00",
    marginLeft: 10,
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
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingsListContainer: {
    alignItems: "right",
  },
  recordingsListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "pink",
  },
  recordingItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5, // Adjust spacing for vertical alignment
    backgroundColor: "white",
    borderRadius: 5,
    marginTop: 5,
  },

  recordingItem: {
    fontSize: 16,
    marginBottom: 5,
    color: "green",
  },

  deleteIcon: {
    color: "black",
    fontSize: 20,
    // Adjust spacing between delete and replace icons
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
