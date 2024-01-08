import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Permissions from "expo-permissions";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getPermissionsAsync();
  }, []);

  const getPermissionsAsync = async () => {
    const AudioPerm = await Audio.requestPermissionsAsync();
    if (AudioPerm.status === "granted") {
      console.log("Audio Permission Granted");
    }
    // const { status } = await Permissions.askAsync(
    //   Permissions.AUDIO_RECORDING,
    //   Permissions.AUDIO_PLAYBACK
    // );
    // if (status !== "granted") {
    //   console.error("Audio permissions not granted!");
    // }
  };

  const toggleRecording = async () => {
    try {
      if (recording) {
        // Dacă înregistrează, oprește și descarcă
        await recording.stopAndUnloadAsync();
        const { sound } = await recording.createNewLoadedSoundAsync(
          {},
          (status) => {
            if (status.didJustFinish) {
              sound.replayAsync();
            }
          }
        );
        setSound(sound);
        setRecording(null);
      } else {
        // Dacă nu înregistrează, începe înregistrarea
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

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {recording ? "Recording..." : "Not Recording"}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={toggleRecording}
        // disabled={isPlaying}
      >
        <Text style={styles.buttonText}>
          {recording ? "Stop Recording" : "Start Recording"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.playButton]}
        onPress={togglePlayStop}
        // disabled={recording}
      >
        <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Play"}</Text>
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
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
