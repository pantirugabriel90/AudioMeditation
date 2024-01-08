import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
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
    const { status } = await Permissions.askAsync(
      Permissions.AUDIO_RECORDING,
      Permissions.AUDIO_PLAYBACK
    );
    if (status !== "granted") {
      console.error("Audio permissions not granted!");
    }
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
      <Text>{recording ? "Recording..." : "Not Recording"}</Text>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={toggleRecording}
      />
      <Button title={isPlaying ? "Stop" : "Play"} onPress={togglePlayStop} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
