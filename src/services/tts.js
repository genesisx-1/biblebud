import * as Speech from 'expo-speech';

let isSpeaking = false;

export const speak = async (text, options = {}) => {
  try {
    if (isSpeaking) {
      await stop();
    }

    isSpeaking = true;

    const userOnDone = options.onDone;
    const userOnStopped = options.onStopped;
    const userOnError = options.onError;

    Speech.speak(text, {
      language: 'en-US',
      pitch: 0.85, // Lower pitch for male voice
      rate: 0.9,
      voice: 'com.apple.ttsbundle.siri.voice.en-US.CKMale', // Male voice identifier for iOS
      ...options,
      onDone: () => {
        isSpeaking = false;
        if (userOnDone) userOnDone();
      },
      onStopped: () => {
        isSpeaking = false;
        if (userOnStopped) userOnStopped();
      },
      onError: (error) => {
        isSpeaking = false;
        console.error('Speech error:', error);
        if (userOnError) userOnError(error);
      },
    });

    return { success: true };
  } catch (error) {
    isSpeaking = false;
    console.error('TTS error:', error);
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
