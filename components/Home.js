import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("0");
  const [delayUnit, setDelayUnit] = useState("seconds");
  const [recordingsList, setRecordingsList] = useState([]);
  const [recordingName, setRecordingName] = useState("");

  useEffect(() => {
    getPermissionsAsync();
    loadMemorizedRecording();
  }, []);

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

        const fileUri = `${FileSystem.documentDirectory}${recordingName}.wav`;
        await FileSystem.moveAsync({ from: uri, to: fileUri });
        const recordingObject = { name: recordingName, fileUri };

        setRecordingsList((prevList) => [...prevList, recordingObject]);

        await AsyncStorage.setItem(
          "memorizedRecords",
          JSON.stringify([...recordingsList, recordingObject])
        );

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
      console.error("Error loading memorized recordings:", error);
    }
  };

  const replayRecording = async () => {
    try {
      const delaySettings = await AsyncStorage.getItem("delaySettings");
      if (delaySettings) {
        const { repeatDelay: savedRepeatDelay, delayUnit: savedDelayUnit } =
          JSON.parse(delaySettings);

        setRepeatDelay(savedRepeatDelay);
        setDelayUnit(savedDelayUnit);

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
      await AsyncStorage.setItem(
        "delaySettings",
        JSON.stringify({ repeatDelay, delayUnit })
      );

      replayRecording();
    } catch (error) {
      console.error("Error saving delay settings:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/medit.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.recordingsListContainer}>
          <Text style={styles.recordingsListTitle}>Recordings List:</Text>
          {recordingsList.map((recording, index) => (
            <Text key={index} style={styles.recordingItem}>
              {recording.name}
            </Text>
          ))}
        </View>

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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  recordingsListContainer: {
    marginBottom: 20,
  },
  recordingsListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
  },
  recordingItem: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#ffffff",
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
    width: -70,
    marginBottom: 10,
    padding: 10,
    textAlign: "center",
    color: "#ffffff",
  },
  delayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeScreen;
