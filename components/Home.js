import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  AsyncStorage,
} from "react-native";
import { Audio } from "expo-av";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatDelay, setRepeatDelay] = useState("0");
  const [delayUnit, setDelayUnit] = useState("seconds"); // Initial unit is seconds

  useEffect(() => {
    getPermissionsAsync();
    loadMemorizedRecording();
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
      if (recording) {
        const uri = await recording.getURI();
        await AsyncStorage.setItem("memorizedRecording", uri);
        console.log("Recording memorized:", uri);
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

  const saveDelay = () => {
    // You can add additional validation here if needed
    console.log(`Delay: ${repeatDelay} ${delayUnit}`);
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
      </View>
      <TouchableOpacity
        style={[styles.button, styles.memorizeButton]}
        onPress={memorizeRecording}
      >
        <Text style={styles.buttonText}>Memorize Recording</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={saveDelay}
      >
        <Text style={styles.buttonText}>Save Delay</Text>
      </TouchableOpacity>
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
