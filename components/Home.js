import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Updated import
import { Audio } from "expo-av";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("0");
  const [delayUnit, setDelayUnit] = useState("seconds"); // Initial unit is seconds
  const [recordingsList, setRecordingsList] = useState([]);
  const [recordingName, setRecordingName] = useState("");

  useEffect(() => {
    getPermissionsAsync();
    loadMemorizedRecording();
    replayRecording(); // Replay recording when component mounts
  }, []);

  const getPermissionsAsync = async () => {
    const AudioPerm = await Audio.requestPermissionsAsync();
    if (AudioPerm.status === "granted") {
      console.log("Audio Permission Granted");
    }
  };

  const toggleRecording = async () => {
    try {
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

  const togglePlayStop = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
        } else {
          await sound.replayAsync();
        }
        setIsPlaying(!isPlaying);
      }
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
      console.error("Error stopping sound:", error);
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

        // Create a recording object with name and uri
        const recordingObject = { name: recordingName, uri };

        // Save the recording object to AsyncStorage
        await AsyncStorage.setItem(
          "memorizedRecording",
          JSON.stringify(recordingObject)
        );

        // Add the recording object to the list of recordings
        setRecordingsList((prevList) => [...prevList, recordingObject]);

        // Reset the recording name input
        setRecordingName("");

        console.log("Recording memorized:", recordingObject);
      } else {
        console.log("recording is null");
      }
    } catch (error) {
      console.error("Error memorizing recording:", error);
    }
  };
  const loadMemorizedRecording = async () => {
    try {
      const memorizedURI = await AsyncStorage.getItem("memorizedRecording");
      if (memorizedURI) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: memorizedURI },
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
    } catch (error) {
      console.error("Error loading memorized recording:", error);
    }
  };

  const replayRecording = async () => {
    try {
      const delaySettings = await AsyncStorage.getItem("delaySettings");
      if (delaySettings) {
        const { repeatDelay: savedRepeatDelay, delayUnit: savedDelayUnit } =
          JSON.parse(delaySettings);

        // Update state with saved delay and unit
        setRepeatDelay(savedRepeatDelay);
        setDelayUnit(savedDelayUnit);

        // Replay the recording with the updated delay
        const memorizedURI = await AsyncStorage.getItem("memorizedRecording");
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
      console.error("Error replaying recording:", error);
    }
  };

  const saveDelay = async () => {
    try {
      // Save the delay and unit to AsyncStorage
      await AsyncStorage.setItem(
        "delaySettings",
        JSON.stringify({ repeatDelay, delayUnit })
      );

      // Replay the recording immediately with the new delay
      replayRecording();
    } catch (error) {
      console.error("Error saving delay settings:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {recording ? "Recording..." : "Not Recording"}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={toggleRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? "Stop Recording" : "Start Recording"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.playButton]}
        onPress={togglePlayStop}
      >
        <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Play"}</Text>
      </TouchableOpacity>
      <View style={styles.delayContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter delay"
          keyboardType="numeric"
          value={repeatDelay}
          onChangeText={(text) => setRepeatDelay(text)}
        />
        <TouchableOpacity
          style={styles.unitButton}
          onPress={() =>
            setDelayUnit((prevUnit) =>
              prevUnit === "seconds" ? "minutes" : "seconds"
            )
          }
        >
          <Text style={styles.buttonText}>
            {delayUnit === "seconds" ? "Minutes" : "Seconds"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveDelay}
        >
          <Text style={styles.buttonText}>Save Delay</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.memorizeButton]}
        onPress={memorizeRecording}
      >
        <Text style={styles.buttonText}>Memorize Recording</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Enter recording name"
        value={recordingName}
        onChangeText={(text) => setRecordingName(text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#ff0000",
  },
  playButton: {
    backgroundColor: "#00ff00",
  },
  memorizeButton: {
    backgroundColor: "#0000ff",
  },
  saveButton: {
    backgroundColor: "#ffcc00",
  },
  unitButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlign: "center",
  },
  delayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeScreen;
