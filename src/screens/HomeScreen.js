import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, ProgressCircle } from '../components';
import { useAuth } from '../hooks/useAuth';
import { getProfile, getUserDailyVerse, getDailyProgress, getReadingPlans } from '../services/supabase';
import * as Speech from '../services/tts';
import { getGreeting, getTodayDate } from '../utils/dateUtils';
import theme from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const verseCardAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(120, [
      Animated.spring(verseCardAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(actionsAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(progressAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const { data: profileData } = await getProfile(user.id);
    setProfile(profileData);

    const { data: verseData } = await getUserDailyVerse(user.id, profileData?.bible_translation || 'NIV');
    if (verseData) {
      setDailyVerse(verseData);
    }

    const { data: progressData } = await getDailyProgress(user.id, getTodayDate());
    setTodayProgress(progressData);

    const { data: plans } = await getReadingPlans(user.id);
    if (plans) {
      const active = plans.find((p) => p.is_active && !p.completed_at);
      setActivePlan(active);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSpeakVerse = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      await Speech.stop();
    } else {
      setIsSpeaking(true);
      try {
        await Speech.speak(
          `${dailyVerse.verse_text}. ${dailyVerse.verse_reference}`,
          {
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          }
        );
      } catch (error) {
        console.error('Error speaking verse:', error);
        setIsSpeaking(false);
      }
    }
  };

  const handleShareVerse = async () => {
    if (!dailyVerse) return;
    try {
      await Share.share({
        message: `"${dailyVerse.verse_text}"\n\n- ${dailyVerse.verse_reference}\n\nShared from Bible Bro`,
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend';

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradients.navy}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingSmall}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={theme.colors.primary.warmGold} />
            <Text style={styles.streakText}>{profile?.streak_count || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Verse of the Day */}
          <Animated.View
            style={{
              opacity: verseCardAnim,
              transform: [{
                translateY: verseCardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            <View style={styles.verseCard}>
              <View style={styles.verseDecoTop}>
                <View style={styles.verseLine} />
                <Ionicons name="book" size={16} color={theme.colors.primary.warmGold} />
                <View style={styles.verseLine} />
              </View>

              <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
              {dailyVerse?.theme && (
                <Text style={styles.verseTheme}>{dailyVerse.theme}</Text>
              )}

              <Text style={styles.verseText}>
                {dailyVerse?.verse_text || 'Loading...'}
              </Text>

              <Text style={styles.verseReference}>
                {dailyVerse?.verse_reference || ''}
              </Text>

              <View style={styles.verseDecoBottom}>
                <View style={styles.verseLine} />
              </View>

              <View style={styles.verseActions}>
                <TouchableOpacity onPress={handleSpeakVerse} style={styles.verseActionBtn}>
                  <Ionicons
                    name={isSpeaking ? 'stop-circle' : 'volume-medium'}
                    size={20}
                    color={theme.colors.primary.royalBlue}
                  />
                  <Text style={styles.verseActionText}>
                    {isSpeaking ? 'Stop' : 'Listen'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShareVerse} style={styles.verseActionBtn}>
                  <Ionicons name="share-outline" size={20} color={theme.colors.primary.royalBlue} />
                  <Text style={styles.verseActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={{
              opacity: actionsAnim,
              transform: [{
                translateY: actionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            <Text style={styles.sectionTitle}>Continue Your Journey</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('BibleReading')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={styles.actionGradient}
                >
                  <Ionicons name="book-outline" size={28} color={theme.colors.primary.pureWhite} />
                  <Text style={styles.actionTitle}>Today's{'\n'}Reading</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.colors.gradients.gold}
                  style={styles.actionGradient}
                >
                  <Ionicons name="chatbubbles-outline" size={28} color={theme.colors.primary.pureWhite} />
                  <Text style={styles.actionTitle}>Chat with{'\n'}Bible Bro</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Bible')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.colors.gradients.green}
                  style={styles.actionGradient}
                >
                  <Ionicons name="search-outline" size={28} color={theme.colors.primary.pureWhite} />
                  <Text style={styles.actionTitle}>Bible{'\n'}Reader</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Today's Progress */}
          <Animated.View
            style={{
              opacity: progressAnim,
              transform: [{
                translateY: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <ProgressCircle
                    progress={todayProgress?.reading_completed ? 100 : 0}
                    size={68}
                    strokeWidth={6}
                    color={theme.colors.primary.royalBlue}
                  >
                    <Ionicons
                      name={todayProgress?.reading_completed ? 'checkmark' : 'book-outline'}
                      size={22}
                      color={theme.colors.primary.royalBlue}
                    />
                  </ProgressCircle>
                  <Text style={styles.progressLabel}>Reading</Text>
                </View>

                <View style={styles.progressItem}>
                  <ProgressCircle
                    progress={todayProgress?.chat_messages_count > 0 ? 100 : 0}
                    size={68}
                    strokeWidth={6}
                    color={theme.colors.primary.warmGold}
                  >
                    <Ionicons
                      name={todayProgress?.chat_messages_count > 0 ? 'checkmark' : 'chatbubbles-outline'}
                      size={22}
                      color={theme.colors.primary.warmGold}
                    />
                  </ProgressCircle>
                  <Text style={styles.progressLabel}>Chat</Text>
                </View>

                <View style={styles.progressItem}>
                  <ProgressCircle
                    progress={0}
                    size={68}
                    strokeWidth={6}
                    color={theme.colors.secondary.sageGreen}
                  >
                    <Ionicons
                      name="trophy-outline"
                      size={22}
                      color={theme.colors.secondary.sageGreen}
                    />
                  </ProgressCircle>
                  <Text style={styles.progressLabel}>Quiz</Text>
                </View>
              </View>
            </View>

            {/* Active Reading Plan */}
            {activePlan && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('BibleReading', {
                    readingPlan: {
                      plan_type: activePlan.plan_type,
                      current_day: activePlan.current_day,
                      total_days: activePlan.total_days,
                      title: activePlan.title,
                    },
                  });
                }}
                activeOpacity={0.7}
                style={styles.planCard}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planIconContainer}>
                    <Ionicons name="library" size={20} color={theme.colors.primary.pureWhite} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planLabel}>Active Reading Plan</Text>
                    <Text style={styles.planName}>{activePlan.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text.light} />
                </View>
                <View style={styles.planProgressContainer}>
                  <View style={styles.planProgressBar}>
                    <View
                      style={[
                        styles.planProgressFill,
                        { width: `${((activePlan.current_day + 1) / activePlan.total_days) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.planProgress}>
                    Day {activePlan.current_day + 1} of {activePlan.total_days}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Bottom spacer */}
          <View style={{ height: 24 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSmall: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.pureWhite,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Verse Card
  verseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...theme.shadows.medium,
  },
  verseDecoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  verseDecoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  verseLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  verseLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  verseTheme: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.warmGold,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: 16,
  },
  verseText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.verse,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.verse,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.serif,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: 12,
  },
  verseActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  verseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.background.lightBlue,
  },
  verseActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.medium,
  },
  // Quick Actions
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  actionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 110,
  },
  actionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.pureWhite,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.sm * 1.3,
  },
  // Progress
  progressCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.small,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  // Plan Card
  planCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    ...theme.shadows.small,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  planProgressContainer: {
    gap: 6,
  },
  planProgressBar: {
    height: 6,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary.sageGreen,
    borderRadius: theme.borderRadius.full,
  },
  planProgress: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});

export default HomeScreen;
