import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
const Tutorial = ({ sound }) => {
  return (
    <View>
      <Text>podcast</Text>
    </View>
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

export default Tutorial;
