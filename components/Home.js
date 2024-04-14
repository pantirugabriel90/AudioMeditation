import React, { useState, useEffect } from "react";
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

const HomeScreen = () => {
  const [selectedRecordingIndex, setSelectedRecordingIndex] = useState(null);
  const [recording, setRecording] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("0");
  const [delayUnit, setDelayUnit] = useState("seconds");
  const [recordingsList, setRecordingsList] = useState([]);
  const [recordingName, setRecordingName] = useState("");

  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );

  useEffect(() => {
    getPermissionsAsync();
    loadMemorizedRecording();
  }, []);
  useFocusEffect(() => {
    loadSelectedImage().then((storedImage) => {
      if (storedImage !== null) {
        setBackgroundImage(getBackgroundImage(storedImage));
      }
    });
  });
  const getPermissionsAsync = async () => {
    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      if (audioPermission.status !== "granted") {
        console.log("Audio permission not granted");
        return;
      }
      console.log("Audio and file system permissions granted");
    } catch (error) {
      console.error("Error getting permissions:", error);
    }
  };

  const toggleRecording = async () => {
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
      console.error("Error:", error);
    }
  };

  const togglePlayStop = async (recordIndex) => {
    try {
      //if (sound) {
      console.log("isPlaying");
      console.log(isPlaying);
      if (isPlaying) {
        await stopSound();
      } else {
        if (recordIndex !== null) {
          console.log("recordIndex  " + recordIndex);
          const selectedRecording = recordingsList[recordIndex];
          console.log(
            "test" +
              selectedRecording.fileUri +
              " " +
              selectedRecording.name +
              " " +
              recordIndex
          );
          const { sound } = await Audio.Sound.createAsync(
            { uri: selectedRecording.fileUri },
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

          await sound.replayAsync();
        } else {
          await sound.replayAsync();
        }
      }
      setIsPlaying(!isPlaying);
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
      if (delaySettings) {
        const { repeatDelay: savedRepeatDelay, delayUnit: savedDelayUnit } =
          JSON.parse(delaySettings);

        setRepeatDelay(savedRepeatDelay);
        setDelayUnit(savedDelayUnit);
        console.log("specificRecording");
        console.log(specificRecording);
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
      }
    } catch (error) {
      console.log("Error replaying recording:", error);
    }
  };

  const saveDelay = async () => {
    try {
      await AsyncStorage.setItem(
        "delaySettings",
        JSON.stringify({ repeatDelay, delayUnit })
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
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={toggleRecording}
          >
            <Text style={styles.buttonText}>
              {recording ? "Stop Recording" : "Record"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={togglePlayStop}
          >
            <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Play"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.memorizeButton]}
            onPress={memorizeRecording}
          >
            <Text style={styles.buttonText}>Save Recording</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.delayContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter delay"
            keyboardType="numeric"
            value={repeatDelay}
            onChangeText={(text) => setRepeatDelay(text)}
          />

          <View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="minutes"
                status={delayUnit === "minutes" ? "checked" : "unchecked"}
                onPress={() => setDelayUnit("minutes")}
                color="#ffcc00"
              />
              <Text style={styles.radioButtonLabel}>Minutes</Text>
            </View>
            <View style={styles.radioContainer}>
              <RadioButton
                value="seconds"
                status={delayUnit === "seconds" ? "checked" : "unchecked"}
                onPress={() => setDelayUnit("seconds")}
                color="#ffcc00"
              />
              <Text style={styles.radioButtonLabel}>Seconds</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveDelay}
          >
            <Text style={styles.buttonText}>Save Delay</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter recording name"
          value={recordingName}
          onChangeText={(text) => setRecordingName(text)}
        />
        <View style={styles.recordingsListContainer}>
          <Text style={styles.recordingsListTitle}>Recordings List:</Text>
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
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
  input: {
    backgroundColor: "pink",
    height: 40,
    borderColor: "purple",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlign: "center",
  },
  delayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
    marginBottom: -30,
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
});

export default HomeScreen;
