import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { updateProfile } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import theme from '../constants/theme';

const QUESTIONS = [
  {
    id: 1,
    question: 'What brings you to Bible Bro today?',
    options: [
      { icon: 'heart', text: 'Grow my faith', value: 'grow_faith' },
      { icon: 'people', text: 'Find community', value: 'find_community' },
      { icon: 'book', text: 'Learn the Bible', value: 'learn_bible' },
      { icon: 'shield', text: 'Find guidance', value: 'find_guidance' },
    ],
  },
  {
    id: 2,
    question: 'What areas of life need guidance?',
    options: [
      { icon: 'heart-dislike', text: 'Relationships', value: 'relationships' },
      { icon: 'briefcase', text: 'Work & Career', value: 'work' },
      { icon: 'sad', text: 'Anxiety & Stress', value: 'anxiety' },
      { icon: 'compass', text: 'Purpose & Direction', value: 'purpose' },
    ],
  },
  {
    id: 3,
    question: 'When do you prefer to study?',
    options: [
      { icon: 'sunny', text: 'Morning', value: 'morning' },
      { icon: 'partly-sunny', text: 'Afternoon', value: 'afternoon' },
      { icon: 'moon', text: 'Evening', value: 'evening' },
      { icon: 'time', text: 'Anytime', value: 'anytime' },
    ],
  },
  {
    id: 4,
    question: 'Preferred Bible translation?',
    options: [
      { icon: 'book', text: 'NIV', value: 'NIV' },
      { icon: 'book', text: 'KJV', value: 'KJV' },
      { icon: 'book', text: 'ESV', value: 'ESV' },
      { icon: 'book', text: 'NLT', value: 'NLT' },
    ],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleSelectOption = (value) => {
    setAnswers({
      ...answers,
      [QUESTIONS[currentStep].id]: value,
    });
  };

  const handleNext = () => {
    if (!answers[QUESTIONS[currentStep].id]) {
      Alert.alert('Please select an option', 'Choose an option to continue');
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      // Animate transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    const { error } = await updateProfile(user.id, {
      onboarding_completed: true,
      bible_translation: answers[4] || 'NIV',
      daily_reminder_time: getTimeFromPreference(answers[3]),
    });

    if (error) {
      Alert.alert('Error', 'Failed to save preferences');
      setLoading(false);
      return;
    }

    // Navigation handled by useAuth hook
    setLoading(false);
  };

  const getTimeFromPreference = (preference) => {
    switch (preference) {
      case 'morning':
        return '08:00:00';
      case 'afternoon':
        return '14:00:00';
      case 'evening':
        return '20:00:00';
      default:
        return '09:00:00';
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <LinearGradient
      colors={[theme.colors.primary.royalBlue, theme.colors.gradients.primary[1]]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {QUESTIONS.length}
          </Text>
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.question}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelectOption(option.value)}
                activeOpacity={0.8}
              >
                <Card
                  style={[
                    styles.optionCard,
                    answers[currentQuestion.id] === option.value && styles.selectedCard,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={32}
                    color={
                      answers[currentQuestion.id] === option.value
                        ? theme.colors.primary.royalBlue
                        : theme.colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      answers[currentQuestion.id] === option.value && styles.selectedText,
                    ]}
                  >
                    {option.text}
                  </Text>
                  {answers[currentQuestion.id] === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.secondary.sageGreen}
                      style={styles.checkmark}
                    />
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button
              title="Back"
              variant="outline"
              onPress={() => setCurrentStep(currentStep - 1)}
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === QUESTIONS.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            loading={loading}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  progressContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.warmGold,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    color: theme.colors.primary.pureWhite,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.pureWhite,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: theme.colors.primary.royalBlue,
    backgroundColor: theme.colors.background.lightBlue,
  },
  optionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedText: {
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.bold,
  },
  checkmark: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  backButton: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  nextButton: {
    flex: 2,
  },
});

export default OnboardingScreen;
