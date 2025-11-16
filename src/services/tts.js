import * as Speech from 'expo-speech';

let isSpeaking = false;

export const speak = async (text, options = {}) => {
  try {
    if (isSpeaking) {
      await stop();
    }

    isSpeaking = true;

    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        isSpeaking = false;
      },
      onStopped: () => {
        isSpeaking = false;
      },
      onError: () => {
        isSpeaking = false;
      },
      ...options,
    });

    return { success: true };
  } catch (error) {
    isSpeaking = false;
    return { success: false, error };
  }
};

export const stop = async () => {
  try {
    await Speech.stop();
    isSpeaking = false;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const pause = async () => {
  try {
    await Speech.pause();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const resume = async () => {
  try {
    await Speech.resume();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const isSpeakingNow = () => isSpeaking;

export default {
  speak,
  stop,
  pause,
  resume,
  isSpeakingNow,
};
