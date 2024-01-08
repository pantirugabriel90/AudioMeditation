import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Permissions from "expo-permissions";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    getPermissionsAsync();
  }, []);

  const getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.AUDIO_RECORDING,
      Permissions.AUDIO_PLAYBACK
    );
    if (status !== "granted") {
      console.error("Audio permissions not granted!");
    }
  };

  const startRecording = async () => {
    try {
      const recordingObj = new Audio.Recording();
      await recordingObj.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recordingObj.startAsync();
      setRecording(recordingObj);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
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
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const playSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        // Reset the sound to allow replay from the beginning
        await sound.setPositionAsync(0);
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{recording ? "Recording..." : "Not Recording"}</Text>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      <View style={styles.buttonsContainer}>
        <Button title="Play" onPress={playSound} />
        <Button title="Stop" onPress={stopSound} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
});

export default HomeScreen;
