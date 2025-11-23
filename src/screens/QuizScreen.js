import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { getQuizQuestions, getQuizQuestionsByBook, getQuizQuestionsByChapter, saveQuizResult, addAchievement } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENT_TYPES, getAchievement } from '../constants/achievements';
import theme from '../constants/theme';

const QUIZ_MODES = {
  RANDOM: 'random',
  BOOK: 'book',
  CHAPTER: 'chapter',
};

const POPULAR_BOOKS = [
  { name: 'Genesis', testament: 'Old' },
  { name: 'Psalms', testament: 'Old' },
  { name: 'Proverbs', testament: 'Old' },
  { name: 'Matthew', testament: 'New' },
  { name: 'Mark', testament: 'New' },
  { name: 'Luke', testament: 'New' },
  { name: 'John', testament: 'New' },
  { name: 'Acts', testament: 'New' },
  { name: 'Romans', testament: 'New' },
  { name: '1 Corinthians', testament: 'New' },
  { name: 'Ephesians', testament: 'New' },
  { name: 'Philippians', testament: 'New' },
  { name: 'Revelation', testament: 'New' },
];

const QuizScreen = ({ route }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState(QUIZ_MODES.RANDOM);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  // Check if quiz was launched from reading screen
  useEffect(() => {
    if (route?.params?.book) {
      setSelectedBook(route.params.book);
      if (route.params.chapter) {
        setSelectedChapter(route.params.chapter);
        setMode(QUIZ_MODES.CHAPTER);
      } else {
        setMode(QUIZ_MODES.BOOK);
      }
    }
  }, [route?.params]);

  useEffect(() => {
    loadQuestions();
  }, [mode, selectedBook, selectedChapter]);

  const getFallbackQuestions = () => {
    return [
      {
        id: 1,
        question: 'Who parted the Red Sea?',
        options: ['Noah', 'Moses', 'Abraham', 'David'],
        correct_answer: 'Moses',
        reference: 'Exodus 14:21',
      },
      {
        id: 2,
        question: 'How many disciples did Jesus have?',
        options: ['10', '11', '12', '13'],
        correct_answer: '12',
        reference: 'Matthew 10:1-4',
      },
      {
        id: 3,
        question: 'What is the shortest verse in the Bible?',
        options: ['Jesus wept.', 'God is love.', 'Pray always.', 'Be still.'],
        correct_answer: 'Jesus wept.',
        reference: 'John 11:35',
      },
      {
        id: 4,
        question: 'Who built the ark?',
        options: ['Moses', 'Noah', 'Abraham', 'Solomon'],
        correct_answer: 'Noah',
        reference: 'Genesis 6-9',
      },
      {
        id: 5,
        question: 'What was the first book of the Bible?',
        options: ['Exodus', 'Matthew', 'Genesis', 'Psalms'],
        correct_answer: 'Genesis',
        reference: 'Genesis 1:1',
      },
    ];
  };

  const fallbackQuestions = useMemo(() => getFallbackQuestions(), []);

  const loadQuestions = async () => {
    setQuestions(fallbackQuestions);
    setFetching(true);
    
    try {
      let data, error;
      
      if (mode === QUIZ_MODES.CHAPTER && selectedBook && selectedChapter) {
        ({ data, error } = await getQuizQuestionsByChapter(selectedBook, selectedChapter, 5));
      } else if (mode === QUIZ_MODES.BOOK && selectedBook) {
        ({ data, error } = await getQuizQuestionsByBook(selectedBook, 5));
      } else {
        ({ data, error } = await getQuizQuestions(5));
      }
      
      if (error) {
        console.error('Quiz error:', error);
      } else if (data && data.length > 0) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setFetching(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setResultsSaved(false);
    setNewAchievements([]);
    loadQuestions();
  };

  const handleChangeMode = (newMode) => {
    setMode(newMode);
    setShowModeSelector(false);
    
    if (newMode === QUIZ_MODES.BOOK || newMode === QUIZ_MODES.CHAPTER) {
      setShowBookSelector(true);
    } else {
      setSelectedBook(null);
      setSelectedChapter(null);
      resetQuiz();
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setShowBookSelector(false);
    if (mode === QUIZ_MODES.CHAPTER) {
      // For now, default to chapter 1
      setSelectedChapter(1);
    }
    resetQuiz();
  };

  if (questions.length === 0 || fetching) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary.royalBlue} />
        <Text style={styles.loadingText}>Loading quiz questions...</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === question.correct_answer;

    if (isCorrect) {
      setScore(score + 1);
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

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
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

      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz finished - save results and check achievements
      setShowResults(true);
      await saveResults();
    }
  };

  const saveResults = async () => {
    if (!user || resultsSaved) return;
    
    try {
      // Save quiz result
      await saveQuizResult(user.id, score, questions.length);
      setResultsSaved(true);
      
      // Check and award achievements
      const earnedAchievements = [];
      
      // Perfect score achievement
      if (score === questions.length) {
        const achievement = getAchievement(ACHIEVEMENT_TYPES.QUIZ_PERFECT);
        const { alreadyEarned } = await addAchievement(
          user.id,
          achievement.id,
          achievement.title,
          achievement.description
        );
        if (!alreadyEarned) {
          earnedAchievements.push(achievement);
        }
      }
      
      // First quiz achievement
      const firstQuizAchievement = getAchievement(ACHIEVEMENT_TYPES.FIRST_QUIZ);
      const { alreadyEarned: firstQuizEarned } = await addAchievement(
        user.id,
        firstQuizAchievement.id,
        firstQuizAchievement.title,
        firstQuizAchievement.description
      );
      if (!firstQuizEarned) {
        earnedAchievements.push(firstQuizAchievement);
      }
      
      setNewAchievements(earnedAchievements);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const isPerfect = score === questions.length;
    const isGood = percentage >= 70;

    return (
      <LinearGradient
        colors={[theme.colors.primary.royalBlue, theme.colors.gradients.primary[1]]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            <Ionicons
              name={isPerfect ? 'trophy' : isGood ? 'ribbon' : 'star'}
              size={80}
              color={theme.colors.primary.warmGold}
            />
            <Text style={styles.resultsTitle}>
              {isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : 'Keep Learning!'}
            </Text>
            <Text style={styles.resultsScore}>
              {score} / {questions.length}
            </Text>
            <Text style={styles.resultsPercentage}>{percentage.toFixed(0)}%</Text>
            
            {mode !== QUIZ_MODES.RANDOM && (
              <Text style={styles.quizContext}>
                {mode === QUIZ_MODES.CHAPTER && `${selectedBook} ${selectedChapter}`}
                {mode === QUIZ_MODES.BOOK && selectedBook}
              </Text>
            )}

            {/* New Achievements Earned */}
            {newAchievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                <Text style={styles.achievementsTitle}>New Achievements! 🎉</Text>
                {newAchievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementBadge}>
                    <Ionicons name={achievement.icon} size={24} color={achievement.color} />
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementName}>{achievement.title}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.resultsButtons}>
              <Button title="Try Again" onPress={resetQuiz} style={styles.resultButton} />
              <Button
                title="Change Mode"
                onPress={() => {
                  setShowResults(false);
                  setShowModeSelector(true);
                }}
                variant="outline"
                style={styles.resultButton}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Mode Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setShowModeSelector(true)}
        >
          <Ionicons name="options" size={20} color={theme.colors.primary.royalBlue} />
          <Text style={styles.modeButtonText}>
            {mode === QUIZ_MODES.RANDOM && 'Random Quiz'}
            {mode === QUIZ_MODES.BOOK && `${selectedBook} Quiz`}
            {mode === QUIZ_MODES.CHAPTER && `${selectedBook} ${selectedChapter}`}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Question Card */}
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <Text style={styles.questionNumber}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correct_answer;
              const showCorrect = isAnswered && isCorrect;
              const showIncorrect = isAnswered && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionButtonCorrect,
                    showIncorrect && styles.optionButtonIncorrect,
                  ]}
                  onPress={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (showCorrect || showIncorrect) && styles.optionTextBold,
                    ]}
                  >
                    {option}
                  </Text>
                  {showCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  )}
                  {showIncorrect && (
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {isAnswered && (
            <Card style={styles.explanationCard}>
              <Text style={styles.explanationLabel}>Scripture Reference:</Text>
              <Text style={styles.explanationText}>{question.reference}</Text>
            </Card>
          )}

          {isAnswered && (
            <Button title="Next Question" onPress={handleNext} style={styles.nextButton} />
          )}
        </Animated.View>

        {/* Celebration Animation */}
        <Animated.View
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnim,
              transform: [
                {
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="star" size={100} color={theme.colors.primary.warmGold} />
        </Animated.View>
      </ScrollView>

      {/* Mode Selector Modal */}
      <Modal
        visible={showModeSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Quiz Mode</Text>
              <TouchableOpacity onPress={() => setShowModeSelector(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => handleChangeMode(QUIZ_MODES.RANDOM)}
            >
              <Ionicons name="shuffle" size={24} color={theme.colors.primary.royalBlue} />
              <View style={styles.modeOptionText}>
                <Text style={styles.modeOptionTitle}>Random Quiz</Text>
                <Text style={styles.modeOptionDesc}>Mixed questions from all books</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => handleChangeMode(QUIZ_MODES.BOOK)}
            >
              <Ionicons name="book" size={24} color={theme.colors.primary.royalBlue} />
              <View style={styles.modeOptionText}>
                <Text style={styles.modeOptionTitle}>Book Quiz</Text>
                <Text style={styles.modeOptionDesc}>Test knowledge of a specific book</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => handleChangeMode(QUIZ_MODES.CHAPTER)}
            >
              <Ionicons name="document-text" size={24} color={theme.colors.primary.royalBlue} />
              <View style={styles.modeOptionText}>
                <Text style={styles.modeOptionTitle}>Chapter Quiz</Text>
                <Text style={styles.modeOptionDesc}>Test knowledge of a specific chapter</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book Selector Modal */}
      <Modal
        visible={showBookSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Book</Text>
              <TouchableOpacity onPress={() => setShowBookSelector(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {POPULAR_BOOKS.map((book) => (
                <TouchableOpacity
                  key={book.name}
                  style={styles.bookOption}
                  onPress={() => handleSelectBook(book.name)}
                >
                  <Text style={styles.bookOptionText}>{book.name}</Text>
                  <Text style={styles.bookOptionTestament}>{book.testament} Testament</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },
  modeButtonText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.border.light,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.secondary.sageGreen,
  },
  content: {
    padding: theme.spacing.md,
  },
  questionCard: {
    gap: theme.spacing.lg,
  },
  questionNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  questionText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.relaxed,
  },
  optionsContainer: {
    gap: theme.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  optionButtonCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '20',
  },
  optionButtonIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '20',
  },
  optionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  optionTextBold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  explanationCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.lightBlue,
  },
  explanationLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.royalBlue,
    marginBottom: theme.spacing.xs,
  },
  explanationText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  nextButton: {
    marginTop: theme.spacing.md,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  resultsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  resultsScore: {
    fontSize: theme.typography.fontSize.huge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.royalBlue,
  },
  resultsPercentage: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
  },
  quizContext: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  achievementsContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.lightGold,
    borderRadius: theme.borderRadius.md,
  },
  achievementsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary.pureWhite,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  achievementDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  resultsButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  resultButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  modeOptionText: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  modeOptionDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  bookOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  bookOptionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  bookOptionTestament: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default QuizScreen;
