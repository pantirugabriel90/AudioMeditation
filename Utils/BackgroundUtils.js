// File: backgroundUtils.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSelectedImage = async (imageNumber) => {
  try {
    await AsyncStorage.setItem("selectedImage", imageNumber.toString());
  } catch (error) {
    console.error("Error saving selected image:", error);
  }
};

export const loadSelectedImage = async () => {
  try {
    const storedImage = await AsyncStorage.getItem("selectedImage");
    return storedImage ? parseInt(storedImage, 10) : null;
  } catch (error) {
    console.error("Error loading selected image:", error);
    return null;
  }
};

export const getBackgroundImage = (imageNumber) => {
  switch (imageNumber) {
    case 1:
      return require("../assets/image1.jpg");

    case 2:
      return require("../assets/image2.jpg");

    case 3:
      return require("../assets/image3.jpg");

    case 4:
      return require("../assets/image4.jpg");

    case 5:
      return require("../assets/image5.jpg");

    default:
      return require("../assets/medit.jpg");
  }
};
