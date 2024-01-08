// HomeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { Audio } from "expo-av";
import * as Permissions from "expo-permissions";

const Home = () => {
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

  // ...

  // ...

  const stopRecording = async () => {
    try {
      if (recording) {
        if (recording.getStatusAsync) {
          const status = await recording.getStatusAsync();
          if (status.canRecord) {
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
            setRecording(null); // Reset the recording state
          }
        }
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  // ...

  // ...

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{recording ? "Recording..." : "Not Recording"}</Text>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      {sound && (
        <>
          <Text>Playing Recorded Sound</Text>
          <Button title="Play" onPress={() => sound.replayAsync()} />
        </>
      )}
    </View>
    // <View>
    //   <Text>Home Screen</Text>
    // </View>
  );
};

export default Home;
