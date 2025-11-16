import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, StreakCounter, ProgressCircle } from '../components';
import { useAuth } from '../hooks/useAuth';
import { getProfile, getDailyVerse, getDailyProgress } from '../services/supabase';
import { speak } from '../services/tts';
import { getGreeting, getTodayDate } from '../utils/dateUtils';
import theme from '../constants/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    if (!user) return;

    // Load profile
    const { data: profileData } = await getProfile(user.id);
    setProfile(profileData);

    // Load daily verse (mock data for now)
    setDailyVerse({
      verse_text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      verse_reference: "Jeremiah 29:11",
      theme: "Hope & Purpose",
    });

    // Load today's progress
    const { data: progressData } = await getDailyProgress(user.id, getTodayDate());
    setTodayProgress(progressData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSpeakVerse = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      await speak.stop();
    } else {
      setIsSpeaking(true);
      await speak.speak(
        `${dailyVerse.verse_text}. ${dailyVerse.verse_reference}`,
        {
          onDone: () => setIsSpeaking(false),
        }
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Friend'}!
        </Text>

        {/* Streak Counter */}
        <StreakCounter streak={profile?.streak_count || 0} style={styles.streakCounter} />

        {/* Daily Verse Card */}
        <Card style={styles.verseCard} variant="lightBlue">
          <View style={styles.verseHeader}>
            <View>
              <Text style={styles.verseLabel}>Verse of the Day</Text>
              <Text style={styles.verseTheme}>{dailyVerse?.theme}</Text>
            </View>
            <TouchableOpacity onPress={handleSpeakVerse} style={styles.speakerButton}>
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-high'}
                size={28}
                color={theme.colors.primary.royalBlue}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.verseText}>{dailyVerse?.verse_text}</Text>
          <Text style={styles.verseReference}>{dailyVerse?.verse_reference}</Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="chatbubbles" size={32} color={theme.colors.primary.pureWhite} />
            </View>
            <Text style={styles.actionText}>Chat with Bible Bro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Plans')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="book" size={32} color={theme.colors.primary.pureWhite} />
            </View>
            <Text style={styles.actionText}>Today's Reading</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Overview */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressCircle
                progress={todayProgress?.reading_completed ? 100 : 0}
                size={80}
                strokeWidth={8}
              >
                <Ionicons
                  name={todayProgress?.reading_completed ? 'checkmark' : 'book-outline'}
                  size={24}
                  color={theme.colors.primary.royalBlue}
                />
              </ProgressCircle>
              <Text style={styles.progressLabel}>Reading</Text>
            </View>

            <View style={styles.progressItem}>
              <ProgressCircle
                progress={todayProgress?.chat_messages_count > 0 ? 100 : 0}
                size={80}
                strokeWidth={8}
              >
                <Ionicons
                  name={todayProgress?.chat_messages_count > 0 ? 'checkmark' : 'chatbubbles-outline'}
                  size={24}
                  color={theme.colors.primary.royalBlue}
                />
              </ProgressCircle>
              <Text style={styles.progressLabel}>Chat</Text>
            </View>

            <View style={styles.progressItem}>
              <ProgressCircle
                progress={0}
                size={80}
                strokeWidth={8}
              >
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color={theme.colors.primary.royalBlue}
                />
              </ProgressCircle>
              <Text style={styles.progressLabel}>Quiz</Text>
            </View>
          </View>
        </Card>

        {/* Continue Reading Plan */}
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Active Reading Plan</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary.royalBlue} />
          </View>
          <Text style={styles.planName}>Gospel of John - Day 3</Text>
          <View style={styles.planProgressBar}>
            <View style={[styles.planProgressFill, { width: '30%' }]} />
          </View>
          <Text style={styles.planProgress}>3 of 10 days completed</Text>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    padding: theme.spacing.md,
  },
  animatedContainer: {
    gap: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  streakCounter: {
    marginVertical: theme.spacing.sm,
  },
  verseCard: {
    padding: theme.spacing.lg,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  verseLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  verseTheme: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary.warmGold,
    marginTop: theme.spacing.xs,
  },
  speakerButton: {
    padding: theme.spacing.xs,
  },
  verseText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.md,
  },
  verseReference: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.bold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  progressCard: {
    padding: theme.spacing.lg,
  },
  progressTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  planCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  planTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  planName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  planProgressBar: {
    height: 8,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary.sageGreen,
    borderRadius: theme.borderRadius.full,
  },
  planProgress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default HomeScreen;
