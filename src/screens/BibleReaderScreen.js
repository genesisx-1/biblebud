import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressCircle } from '../components';
import {
  getBibleVerse,
  getBibleChapter,
  getDailyReadingVerse,
  getReadingPlanVerse,
  getProfile,
  updateProfile,
  getReadingPlans,
  createReadingPlan,
  updateReadingPlanProgress,
} from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import * as Speech from '../services/tts';
import theme from '../constants/theme';
import { READING_PLANS, getPlanVerse } from '../constants/readingPlans';

const BIBLE_VERSIONS = [
  { code: 'NIV', name: 'New International Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'KJV', name: 'King James Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
];

const READING_MODES = {
  DAILY: 'daily',
  PLAN: 'plan',
  READ: 'read',
  MANUAL: 'manual',
};

const BibleReaderScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState(READING_MODES.DAILY);
  const [verseData, setVerseData] = useState(null);
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('NIV');
  const [showVersionModal, setShowVersionModal] = useState(false);

  const [userPlans, setUserPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [showPlansModal, setShowPlansModal] = useState(false);

  const [manualBook, setManualBook] = useState('John');
  const [manualChapter, setManualChapter] = useState('3');
  const [manualVerse, setManualVerse] = useState('16');

  const [readBook, setReadBook] = useState('John');
  const [readChapter, setReadChapter] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserPreferences();
    loadUserPlans();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [user]);

  useEffect(() => {
    if (selectedVersion) {
      cardFadeAnim.setValue(0);
      loadContent();
    }
  }, [selectedVersion, mode, currentDay, activePlan, readBook, readChapter]);

  useEffect(() => {
    if (verseText && !loading) {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [verseText, loading]);

  const loadUserPreferences = async () => {
    if (!user) return;
    const { data: profile } = await getProfile(user.id);
    if (profile?.bible_translation) {
      setSelectedVersion(profile.bible_translation);
    }
  };

  const loadUserPlans = async () => {
    if (!user) return;
    const { data: plans } = await getReadingPlans(user.id);
    setUserPlans(plans || []);

    const active = plans?.find((p) => p.is_active && !p.completed_at);
    if (active) {
      setActivePlan(active);
      setCurrentDay(active.current_day || 0);
    }
  };

  const loadContent = async () => {
    setLoading(true);
    setVerseText('');

    try {
      if (mode === READING_MODES.DAILY) {
        await loadDailyReading();
      } else if (mode === READING_MODES.PLAN && activePlan) {
        await loadReadingPlanVerse();
      } else if (mode === READING_MODES.READ) {
        await loadChapterReading();
      } else if (mode === READING_MODES.MANUAL) {
        await loadManualVerse();
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setVerseText('Error loading content. Please try again.');
    }

    setLoading(false);
  };

  const loadDailyReading = async () => {
    const { data } = await getDailyReadingVerse(selectedVersion);
    if (data && data.text) {
      setVerseData(data);
      setVerseText(data.text);
    } else {
      setVerseData({ reference: 'Daily Verse' });
      setVerseText('For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope. - Jeremiah 29:11');
    }
  };

  const loadReadingPlanVerse = async () => {
    if (!activePlan) return;

    const planVerse = getPlanVerse(activePlan.plan_type, currentDay);

    if (!planVerse) {
      setVerseText('Reading plan content not available.');
      return;
    }

    const verseParts = planVerse.verses.split('-');
    const startVerse = parseInt(verseParts[0]);
    const endVerse = verseParts[1] ? parseInt(verseParts[1]) : startVerse;

    let fullText = '';
    for (let v = startVerse; v <= Math.min(endVerse, startVerse + 20); v++) {
      const { data } = await getBibleVerse(planVerse.book, planVerse.chapter, v, selectedVersion);
      if (data && data.text) {
        fullText += `${v} ${data.text}\n\n`;
      }
    }

    if (fullText) {
      setVerseData({
        book: planVerse.book,
        chapter: planVerse.chapter,
        verse: planVerse.verses,
        reference: `${planVerse.book} ${planVerse.chapter}:${planVerse.verses}`,
        title: planVerse.title,
      });
      setVerseText(fullText.trim());
    } else {
      setVerseText(`Read ${planVerse.book} ${planVerse.chapter}:${planVerse.verses} in your Bible.`);
    }
  };

  const loadManualVerse = async () => {
    const { data } = await getBibleVerse(manualBook, manualChapter, manualVerse, selectedVersion);
    if (data && data.text) {
      setVerseData(data);
      setVerseText(data.text);
    } else {
      setVerseText(`Read ${manualBook} ${manualChapter}:${manualVerse} in your Bible.`);
    }
  };

  const loadChapterReading = async () => {
    const { data, error } = await getBibleChapter(readBook, readChapter, selectedVersion);
    if (data && data.text) {
      setVerseData({
        book: readBook,
        chapter: readChapter,
        reference: `${readBook} ${readChapter}`,
      });
      setVerseText(data.text);
    } else {
      setVerseText(error || `Could not load ${readBook} ${readChapter}. Please try again.`);
    }
  };

  const handleVersionChange = async (version) => {
    setSelectedVersion(version);
    setShowVersionModal(false);
    if (user) {
      await updateProfile(user.id, { bible_translation: version });
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      await Speech.stop();
    } else {
      setIsSpeaking(true);
      const text = `${verseData?.reference || 'Reading'}. ${verseText}`;
      await Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${verseText}"\n\n- ${verseData?.reference || 'Bible Reading'} (${selectedVersion})\n\nShared from Bible Bro`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartPlan = async (template) => {
    if (!user) return;

    const { data } = await createReadingPlan(user.id, {
      plan_type: template.plan_type,
      title: template.title,
      description: template.description,
      total_days: template.total_days,
      current_day: 0,
      is_active: true,
    });

    if (data) {
      setActivePlan(data);
      setCurrentDay(0);
      setMode(READING_MODES.PLAN);
      setShowPlansModal(false);
      await loadUserPlans();
    }
  };

  const handleNextDay = async () => {
    if (!activePlan || currentDay >= activePlan.total_days - 1) return;

    const newDay = currentDay + 1;
    setCurrentDay(newDay);

    if (user) {
      await updateReadingPlanProgress(activePlan.id, newDay);
      await loadUserPlans();
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextChapter = () => {
    setReadChapter(readChapter + 1);
  };

  const handlePreviousChapter = () => {
    if (readChapter > 1) {
      setReadChapter(readChapter - 1);
    }
  };

  const currentVersion = BIBLE_VERSIONS.find(v => v.code === selectedVersion) || BIBLE_VERSIONS[0];

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <Animated.View style={[styles.modeSelector, { opacity: fadeAnim }]}>
        {[
          { key: READING_MODES.DAILY, icon: 'sunny-outline', label: 'Daily' },
          { key: READING_MODES.PLAN, icon: 'list-outline', label: 'Plan' },
          { key: READING_MODES.READ, icon: 'book-outline', label: 'Read' },
          { key: READING_MODES.MANUAL, icon: 'search-outline', label: 'Search' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.modeButton, mode === item.key && styles.modeButtonActive]}
            onPress={() => {
              if (item.key === READING_MODES.PLAN && !activePlan) {
                setShowPlansModal(true);
              } else {
                setMode(item.key);
              }
            }}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={mode === item.key ? theme.colors.primary.pureWhite : theme.colors.text.secondary}
            />
            <Text style={[styles.modeButtonText, mode === item.key && styles.modeButtonTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLabel}>
                {mode === READING_MODES.DAILY && 'Daily Reading'}
                {mode === READING_MODES.PLAN && activePlan && `${activePlan.title} - Day ${currentDay + 1}`}
                {mode === READING_MODES.READ && 'Bible Reading'}
                {mode === READING_MODES.MANUAL && 'Bible Search'}
              </Text>
              {verseData?.title && (
                <Text style={styles.verseTitle}>{verseData.title}</Text>
              )}
              <Text style={styles.reference}>
                {verseData?.reference || 'Loading...'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowVersionModal(true)}
                style={styles.versionPill}
              >
                <Text style={styles.versionPillText}>{selectedVersion}</Text>
                <Ionicons name="chevron-down" size={14} color={theme.colors.primary.royalBlue} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continuous Reading Book/Chapter Selector */}
        {mode === READING_MODES.READ && (
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>Book & Chapter</Text>
            <View style={styles.searchInputs}>
              <TextInput
                style={[styles.searchInput, styles.searchInputBook]}
                value={readBook}
                onChangeText={setReadBook}
                placeholder="Book (e.g., John)"
                placeholderTextColor={theme.colors.text.light}
              />
              <TextInput
                style={styles.searchInput}
                value={String(readChapter)}
                onChangeText={(text) => setReadChapter(parseInt(text) || 1)}
                placeholder="Ch"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.text.light}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={loadChapterReading}
              >
                <Ionicons name="arrow-forward" size={20} color={theme.colors.primary.pureWhite} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Manual Search Input */}
        {mode === READING_MODES.MANUAL && (
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>Enter Reference</Text>
            <View style={styles.searchInputs}>
              <TextInput
                style={[styles.searchInput, styles.searchInputBook]}
                value={manualBook}
                onChangeText={setManualBook}
                placeholder="Book"
                placeholderTextColor={theme.colors.text.light}
              />
              <TextInput
                style={styles.searchInput}
                value={manualChapter}
                onChangeText={setManualChapter}
                placeholder="Ch"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.text.light}
              />
              <TextInput
                style={styles.searchInput}
                value={manualVerse}
                onChangeText={setManualVerse}
                placeholder="Vs"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.text.light}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={loadManualVerse}
              >
                <Ionicons name="search" size={20} color={theme.colors.primary.pureWhite} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Verse Content */}
        <Animated.View style={{ opacity: cardFadeAnim }}>
          <View style={styles.verseCard}>
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={theme.colors.primary.royalBlue} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : verseText ? (
              <>
                <Text style={styles.verseText}>{verseText}</Text>
                {verseData?.reference && (
                  <Text style={styles.referenceFooter}>
                    {verseData.reference} ({selectedVersion})
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>No content available</Text>
            )}
          </View>
        </Animated.View>

        {/* Action Row */}
        {!loading && verseText && (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleSpeak} style={styles.actionBtn}>
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-medium'}
                size={20}
                color={theme.colors.primary.royalBlue}
              />
              <Text style={styles.actionBtnText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color={theme.colors.primary.royalBlue} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Quiz', {
                  book: verseData?.book || manualBook,
                  chapter: verseData?.chapter || manualChapter,
                });
              }}
              style={styles.actionBtn}
            >
              <Ionicons name="trophy-outline" size={20} color={theme.colors.primary.royalBlue} />
              <Text style={styles.actionBtnText}>Quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation for Continuous Reading */}
        {mode === READING_MODES.READ && !loading && (
          <View style={styles.navigationButtons}>
            <Button
              title="Previous"
              onPress={handlePreviousChapter}
              disabled={readChapter === 1}
              variant="outline"
              style={styles.navButton}
            />
            <Button
              title="Next Chapter"
              onPress={handleNextChapter}
              style={styles.navButton}
            />
          </View>
        )}

        {/* Navigation for Reading Plan */}
        {mode === READING_MODES.PLAN && activePlan && (
          <View style={styles.planNavigation}>
            <View style={styles.navigationButtons}>
              <Button
                title="Previous"
                onPress={handlePreviousDay}
                disabled={currentDay === 0}
                variant="outline"
                style={styles.navButton}
              />
              <View style={styles.progressInfo}>
                <ProgressCircle
                  progress={((currentDay + 1) / activePlan.total_days) * 100}
                  size={44}
                  strokeWidth={4}
                />
                <Text style={styles.progressText}>
                  {currentDay + 1}/{activePlan.total_days}
                </Text>
              </View>
              <Button
                title={currentDay === activePlan.total_days - 1 ? "Done" : "Next"}
                onPress={handleNextDay}
                disabled={currentDay >= activePlan.total_days - 1}
                style={styles.navButton}
              />
            </View>
          </View>
        )}

        {/* Change/Start Plan Button */}
        {mode === READING_MODES.PLAN && (
          <Button
            title={activePlan ? "Change Plan" : "Start a Plan"}
            onPress={() => setShowPlansModal(true)}
            variant="outline"
            icon={<Ionicons name="library-outline" size={20} color={theme.colors.primary.royalBlue} />}
            style={styles.changePlanButton}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Reading Plans Modal */}
      <Modal
        visible={showPlansModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlansModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reading Plans</Text>
              <TouchableOpacity onPress={() => setShowPlansModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.planCount}>{READING_PLANS.length} plans available</Text>
              {READING_PLANS.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.planOption}
                  onPress={() => handleStartPlan(template)}
                >
                  <View style={[styles.planIcon, { backgroundColor: template.color }]}>
                    <Ionicons name={template.icon} size={22} color={theme.colors.primary.pureWhite} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>{template.title}</Text>
                    <Text style={styles.planDescription} numberOfLines={2}>{template.description}</Text>
                    <Text style={styles.planDays}>{template.total_days} days</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.light} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Version Selection Modal */}
      <Modal
        visible={showVersionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVersionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bible Version</Text>
              <TouchableOpacity onPress={() => setShowVersionModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {BIBLE_VERSIONS.map((version) => (
                <TouchableOpacity
                  key={version.code}
                  style={[
                    styles.versionOption,
                    selectedVersion === version.code && styles.versionOptionSelected,
                  ]}
                  onPress={() => handleVersionChange(version.code)}
                >
                  <View>
                    <Text
                      style={[
                        styles.versionOptionCode,
                        selectedVersion === version.code && styles.versionOptionCodeSelected,
                      ]}
                    >
                      {version.code}
                    </Text>
                    <Text style={styles.versionOptionName}>{version.name}</Text>
                  </View>
                  {selectedVersion === version.code && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary.royalBlue} />
                  )}
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
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    gap: 6,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.background.secondary,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary.royalBlue,
  },
  modeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  modeButtonTextActive: {
    color: theme.colors.primary.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verseTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: 4,
  },
  reference: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: 4,
  },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background.lightBlue,
  },
  versionPillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  // Search
  searchCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  searchLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  searchInputs: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 10,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  searchInputBook: {
    flex: 2,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Verse Card
  verseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  verseText: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.verse,
    color: theme.colors.text.verse,
    fontFamily: theme.typography.fontFamily.serif,
  },
  referenceFooter: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.light,
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.light,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Action Row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.small,
  },
  actionBtnText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.medium,
  },
  // Navigation
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
  },
  planNavigation: {
    marginBottom: 8,
  },
  progressInfo: {
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  changePlanButton: {
    marginBottom: 12,
  },
  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    padding: 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  // Plans
  planCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.background.secondary,
    marginBottom: 8,
    gap: 12,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  planDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  planDays: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    marginTop: 2,
  },
  // Version
  versionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.background.secondary,
  },
  versionOptionSelected: {
    backgroundColor: theme.colors.background.lightBlue,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.royalBlue,
  },
  versionOptionCode: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  versionOptionCodeSelected: {
    color: theme.colors.primary.royalBlue,
  },
  versionOptionName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

export default BibleReaderScreen;
