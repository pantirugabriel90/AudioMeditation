import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { RadioButton } from "react-native-paper";

const Settings = ({ sound }) => {
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/medit.jpg")
  );
  const [selectedImage, setSelectedImage] = useState(null);

  const startRepeat = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        await sound.replayAsync();
      }
    } catch (error) {
      console.error("Error starting repeat:", error);
    }
  };

  const getBackgroundImage = (imageNumber) => {
    switch (imageNumber) {
      case 1:
        return require("../assets/image1.jpg");

        break;
      case 2:
        return require("../assets/image2.jpg");
        break;
      case 3:
        return require("../assets/image3.jpg");
        break;
      case 4:
        return require("../assets/image4.jpg");
        break;
      case 5:
        return require("../assets/image5.jpg");
        break;
      default:
        return require("../assets/medit.jpg");
    }
  };

  const changeBackgroundColor = (imageNumber) => {
    switch (imageNumber) {
      case 1:
        setBackgroundImage(require("../assets/image1.jpg"));

        break;
      case 2:
        setBackgroundImage(require("../assets/image2.jpg"));
        break;
      case 3:
        setBackgroundImage(require("../assets/image3.jpg"));
        break;
      case 4:
        setBackgroundImage(require("../assets/image4.jpg"));
        break;
      case 5:
        setBackgroundImage(require("../assets/image5.jpg"));
        break;
      default:
        setBackgroundImage(require("../assets/medit.jpg"));
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.radioGroup}>
        {[1, 2, 3, 4, 5].map((imageNumber) => (
          <View key={imageNumber} style={styles.radioButtonContainer}>
            <RadioButton
              value={imageNumber}
              status={selectedImage === imageNumber ? "checked" : "unchecked"}
              onPress={() => changeBackgroundColor(imageNumber)}
            />

            <Text style={styles.radioButtonText}>{`Image ${imageNumber}`}</Text>

            <Image
              source={getBackgroundImage(imageNumber)}
              style={styles.icon}
            />
          </View>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 100,
    height: 60,
    marginRight: 10, // Adjust as needed
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  repeatButton: {
    backgroundColor: "#ff9900",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  radioGroup: {
    flexDirection: "column",
    marginTop: 10,
    alignItems: "flex-start",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButtonText: {
    marginLeft: 5,
  },
});

export default Settings;
