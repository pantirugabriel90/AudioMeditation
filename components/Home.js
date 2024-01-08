import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Permissions from "expo-permissions";

const HomeScreen = () => {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    getPermissionsAsync();
  }, []);

  const getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status !== "granted") {
      console.error("Audio recording permission not granted!");
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

  const stopSound = () => {
    if (sound) {
      sound.stopAsync();
      setSound(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{recording ? "Recording..." : "Not Recording"}</Text>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={stopRecording}
        disabled={!recording} // Disable the button if not recording
      >
        <Text>Stop</Text>
      </TouchableOpacity>
      <Button
        title={recording ? "Recording..." : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
        disabled={!!recording} // Disable the button if already recording
      />
      {sound && (
        <>
          <Text>Playing Recorded Sound</Text>
          <Button title="Play" onPress={() => sound.replayAsync()} />
          <Button title="Stop" onPress={stopSound} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stopButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
});

export default HomeScreen;
