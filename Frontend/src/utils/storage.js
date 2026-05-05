import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredObject = async key => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredObject = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const removeStoredObject = async key => {
  await AsyncStorage.removeItem(key);
};
