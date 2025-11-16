import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import theme from '../constants/theme';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Who parted the Red Sea?',
    options: ['Noah', 'Moses', 'Abraham', 'David'],
    correctAnswer: 'Moses',
    reference: 'Exodus 14:21',
  },
  {
    id: 2,
    question: 'How many disciples did Jesus have?',
    options: ['10', '11', '12', '13'],
    correctAnswer: '12',
    reference: 'Matthew 10:1-4',
  },
  {
    id: 3,
    question: 'What is the shortest verse in the Bible?',
    options: ['Jesus wept.', 'God is love.', 'Pray always.', 'Be still.'],
    correctAnswer: 'Jesus wept.',
    reference: 'John 11:35',
  },
  {
    id: 4,
    question: 'Who built the ark?',
    options: ['Moses', 'Noah', 'Abraham', 'Solomon'],
    correctAnswer: 'Noah',
    reference: 'Genesis 6-9',
  },
  {
    id: 5,
    question: 'What was the first book of the Bible?',
    options: ['Exodus', 'Matthew', 'Genesis', 'Psalms'],
    correctAnswer: 'Genesis',
    reference: 'Genesis 1:1',
  },
];

const QuizScreen = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelectAnswer = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === question.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      // Celebration animation
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
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

      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }, 200);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return <ResultsScreen score={score} total={QUIZ_QUESTIONS.length} onRestart={handleRestart} />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary.royalBlue, theme.colors.gradients.primary[1]]}
        style={styles.header}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <TouchableOpacity style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.primary.pureWhite} />
          </TouchableOpacity>
        </View>

        {/* Question Counter */}
        <Text style={styles.questionCounter}>
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          {/* Question */}
          <Text style={styles.question}>{question.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                option={option}
                isSelected={selectedAnswer === option}
                isCorrect={option === question.correctAnswer}
                isAnswered={isAnswered}
                onPress={() => handleSelectAnswer(option)}
              />
            ))}
          </View>

          {/* Feedback */}
          {isAnswered && (
            <Animated.View
              style={[
                styles.feedbackContainer,
                {
                  backgroundColor:
                    selectedAnswer === question.correctAnswer
                      ? '#E8F5E9'
                      : '#FFEBEE',
                },
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={
                    selectedAnswer === question.correctAnswer
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={32}
                  color={
                    selectedAnswer === question.correctAnswer
                      ? theme.colors.secondary.sageGreen
                      : theme.colors.semantic.error
                  }
                />
                <Text
                  style={[
                    styles.feedbackTitle,
                    {
                      color:
                        selectedAnswer === question.correctAnswer
                          ? theme.colors.secondary.sageGreen
                          : theme.colors.semantic.error,
                    },
                  ]}
                >
                  {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Not quite'}
                </Text>
              </View>
              <Text style={styles.referenceText}>
                Scripture: {question.reference}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next Button */}
      {isAnswered && (
        <View style={styles.footer}>
          <Button
            title={currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      )}

      {/* Celebration Overlay */}
      {selectedAnswer === question.correctAnswer && isAnswered && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnim,
              transform: [
                {
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="trophy" size={100} color={theme.colors.primary.warmGold} />
        </Animated.View>
      )}
    </View>
  );
};

const OptionButton = ({ option, isSelected, isCorrect, isAnswered, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!isAnswered) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getBackgroundColor = () => {
    if (!isAnswered) {
      return isSelected ? theme.colors.background.lightBlue : theme.colors.background.card;
    }

    if (isSelected && isCorrect) {
      return '#E8F5E9'; // Green
    }

    if (isSelected && !isCorrect) {
      return '#FFEBEE'; // Red
    }

    if (isCorrect) {
      return '#E8F5E9'; // Show correct answer
    }

    return theme.colors.background.card;
  };

  const getBorderColor = () => {
    if (!isAnswered) {
      return isSelected ? theme.colors.primary.royalBlue : theme.colors.border.light;
    }

    if (isSelected && isCorrect) {
      return theme.colors.secondary.sageGreen;
    }

    if (isSelected && !isCorrect) {
      return theme.colors.semantic.error;
    }

    if (isCorrect) {
      return theme.colors.secondary.sageGreen;
    }

    return theme.colors.border.light;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isAnswered}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.optionButton,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
          ]}
        >
          <Text style={styles.optionText}>{option}</Text>
          {isAnswered && isCorrect && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.secondary.sageGreen}
            />
          )}
          {isAnswered && isSelected && !isCorrect && (
            <Ionicons name="close-circle" size={24} color={theme.colors.semantic.error} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ResultsScreen = ({ score, total, onRestart }) => {
  const percentage = (score / total) * 100;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primary.royalBlue, theme.colors.gradients.primary[1]]}
      style={styles.resultsContainer}
    >
      <Animated.View style={[styles.resultsContent, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="trophy" size={100} color={theme.colors.primary.warmGold} />

        <Text style={styles.resultsTitle}>Quiz Complete!</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {score} / {total}
          </Text>
          <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
        </View>

        <Text style={styles.resultsMessage}>
          {percentage >= 80
            ? 'Excellent work! You know your Bible!'
            : percentage >= 60
            ? 'Great job! Keep studying!'
            : 'Good effort! Keep learning!'}
        </Text>

        <Button
          title="Try Again"
          onPress={onRestart}
          style={styles.restartButton}
          icon={<Ionicons name="refresh" size={20} color={theme.colors.primary.pureWhite} />}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.warmGold,
    borderRadius: theme.borderRadius.full,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  questionCounter: {
    color: theme.colors.primary.pureWhite,
    fontSize: theme.typography.fontSize.md,
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    ...theme.shadows.small,
  },
  optionText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  feedbackContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  feedbackTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  referenceText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  nextButton: {
    width: '100%',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  resultsContent: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  scoreText: {
    fontSize: theme.typography.fontSize.huge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.royalBlue,
  },
  percentageText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  resultsMessage: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  restartButton: {
    minWidth: 200,
  },
});

export default QuizScreen;
