import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ProgressCircle } from '../components';
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
import { speak } from '../services/tts';
import theme from '../constants/theme';

const BIBLE_VERSIONS = [
  { code: 'NIV', name: 'New International Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'KJV', name: 'King James Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
];

const PLAN_TEMPLATES = [
  {
    id: 1,
    plan_type: 'gospel_of_john',
    title: 'Gospel of John',
    description: 'Explore the life and teachings of Jesus',
    total_days: 10,
    icon: 'book',
    color: theme.colors.primary.royalBlue,
  },
  {
    id: 2,
    plan_type: 'overcoming_anxiety',
    title: 'Overcoming Anxiety',
    description: 'Find peace through scripture',
    total_days: 7,
    icon: 'heart',
    color: theme.colors.secondary.sageGreen,
  },
  {
    id: 3,
    plan_type: 'proverbs_wisdom',
    title: 'Proverbs Wisdom',
    description: 'Daily wisdom for life',
    total_days: 14,
    icon: 'bulb',
    color: theme.colors.primary.warmGold,
  },
  {
    id: 4,
    plan_type: 'new_believer_basics',
    title: 'New Believer Basics',
    description: 'Foundation for your faith journey',
    total_days: 21,
    icon: 'star',
    color: theme.colors.primary.royalBlue,
  },
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
  
  // Reading Plans state
  const [userPlans, setUserPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  // Manual reading state
  const [manualBook, setManualBook] = useState('John');
  const [manualChapter, setManualChapter] = useState('3');
  const [manualVerse, setManualVerse] = useState('16');

  // Continuous reading state
  const [readBook, setReadBook] = useState('John');
  const [readChapter, setReadChapter] = useState(1);

  useEffect(() => {
    loadUserPreferences();
    loadUserPlans();
  }, [user]);

  useEffect(() => {
    if (selectedVersion) {
      loadContent();
    }
  }, [selectedVersion, mode, currentDay, activePlan, readBook, readChapter]);

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
    
    const planVerse = getReadingPlanVerse(activePlan.plan_type, currentDay, selectedVersion);
    
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
      await speak.stop();
    } else {
      setIsSpeaking(true);
      const text = `${verseData?.reference || 'Reading'}. ${verseText}`;
      await speak.speak(text, {
        onDone: () => setIsSpeaking(false),
      });
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
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === READING_MODES.DAILY && styles.modeButtonActive]}
          onPress={() => setMode(READING_MODES.DAILY)}
        >
          <Ionicons 
            name="sunny" 
            size={20} 
            color={mode === READING_MODES.DAILY ? theme.colors.primary.pureWhite : theme.colors.text.secondary} 
          />
          <Text style={[styles.modeButtonText, mode === READING_MODES.DAILY && styles.modeButtonTextActive]}>
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, mode === READING_MODES.PLAN && styles.modeButtonActive]}
          onPress={() => {
            if (activePlan) {
              setMode(READING_MODES.PLAN);
            } else {
              setShowPlansModal(true);
            }
          }}
        >
          <Ionicons
            name="list"
            size={20}
            color={mode === READING_MODES.PLAN ? theme.colors.primary.pureWhite : theme.colors.text.secondary}
          />
          <Text style={[styles.modeButtonText, mode === READING_MODES.PLAN && styles.modeButtonTextActive]}>
            Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === READING_MODES.READ && styles.modeButtonActive]}
          onPress={() => setMode(READING_MODES.READ)}
        >
          <Ionicons
            name="book"
            size={20}
            color={mode === READING_MODES.READ ? theme.colors.primary.pureWhite : theme.colors.text.secondary}
          />
          <Text style={[styles.modeButtonText, mode === READING_MODES.READ && styles.modeButtonTextActive]}>
            Read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === READING_MODES.MANUAL && styles.modeButtonActive]}
          onPress={() => setMode(READING_MODES.MANUAL)}
        >
          <Ionicons
            name="search"
            size={20}
            color={mode === READING_MODES.MANUAL ? theme.colors.primary.pureWhite : theme.colors.text.secondary}
          />
          <Text style={[styles.modeButtonText, mode === READING_MODES.MANUAL && styles.modeButtonTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
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
              <TouchableOpacity 
                onPress={() => setShowVersionModal(true)}
                style={styles.versionButton}
              >
                <Text style={styles.versionText}>{currentVersion.name}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.primary.royalBlue} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSpeak} style={styles.speakerButton}>
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-high'}
                size={32}
                color={theme.colors.primary.royalBlue}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Continuous Reading Book/Chapter Selector */}
        {mode === READING_MODES.READ && (
          <Card style={styles.searchCard}>
            <Text style={styles.searchLabel}>Select Book & Chapter:</Text>
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
                <Ionicons name="book-outline" size={20} color={theme.colors.primary.pureWhite} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Manual Search Input */}
        {mode === READING_MODES.MANUAL && (
          <Card style={styles.searchCard}>
            <Text style={styles.searchLabel}>Enter Bible Reference:</Text>
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
          </Card>
        )}

        {/* Verse Content */}
        <Card style={styles.verseCard}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary.royalBlue} />
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
            <Text style={styles.verseText}>No content available</Text>
          )}
        </Card>

        {/* Test Knowledge Button */}
        {!loading && verseData && (
          <Button
            title="Test Your Knowledge"
            onPress={() => {
              navigation.navigate('Quiz', {
                book: verseData.book || manualBook,
                chapter: verseData.chapter || manualChapter,
              });
            }}
            variant="outline"
            icon={<Ionicons name="trophy" size={20} color={theme.colors.primary.royalBlue} />}
            style={styles.testKnowledgeButton}
          />
        )}

        {/* Navigation for Continuous Reading */}
        {mode === READING_MODES.READ && !loading && (
          <View style={styles.navigationButtons}>
            <Button
              title="◀ Previous Chapter"
              onPress={handlePreviousChapter}
              disabled={readChapter === 1}
              variant="outline"
              style={styles.navButton}
            />
            <Button
              title="Next Chapter ▶"
              onPress={handleNextChapter}
              style={styles.navButton}
            />
          </View>
        )}

        {/* Navigation for Reading Plan */}
        {mode === READING_MODES.PLAN && activePlan && (
          <View style={styles.navigationButtons}>
            <Button
              title="Previous"
              onPress={handlePreviousDay}
              disabled={currentDay === 0}
              variant="outline"
              style={styles.navButton}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {currentDay + 1} / {activePlan.total_days}
              </Text>
              <ProgressCircle
                progress={((currentDay + 1) / activePlan.total_days) * 100}
                size={40}
                strokeWidth={4}
              />
            </View>
            <Button
              title={currentDay === activePlan.total_days - 1 ? "Done" : "Next"}
              onPress={handleNextDay}
              disabled={currentDay >= activePlan.total_days - 1}
              style={styles.navButton}
            />
          </View>
        )}

        {/* Change/Start Plan Button */}
        {mode === READING_MODES.PLAN && (
          <Button
            title={activePlan ? "Change Plan" : "Start a Plan"}
            onPress={() => setShowPlansModal(true)}
            variant="outline"
            icon={<Ionicons name="library" size={20} color={theme.colors.primary.royalBlue} />}
            style={styles.changePlanButton}
          />
        )}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Reading Plan</Text>
              <TouchableOpacity onPress={() => setShowPlansModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {PLAN_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.planOption}
                  onPress={() => handleStartPlan(template)}
                >
                  <View style={[styles.planIcon, { backgroundColor: template.color }]}>
                    <Ionicons name={template.icon} size={24} color={theme.colors.primary.pureWhite} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>{template.title}</Text>
                    <Text style={styles.planDescription}>{template.description}</Text>
                    <Text style={styles.planDays}>{template.total_days} days</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bible Version</Text>
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
                  <Text
                    style={[
                      styles.versionOptionText,
                      selectedVersion === version.code && styles.versionOptionTextSelected,
                    ]}
                  >
                    {version.name}
                  </Text>
                  {selectedVersion === version.code && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary.royalBlue} />
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
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    gap: theme.spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerCard: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  verseTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  reference: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  versionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.medium,
  },
  speakerButton: {
    padding: theme.spacing.xs,
  },
  searchCard: {
    padding: theme.spacing.lg,
  },
  searchLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  searchInputs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  searchInputBook: {
    flex: 2,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseCard: {
    padding: theme.spacing.lg,
    minHeight: 300,
  },
  verseText: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.relaxed,
    color: theme.colors.text.primary,
  },
  referenceFooter: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  navButton: {
    flex: 1,
  },
  progressInfo: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  changePlanButton: {
    marginBottom: theme.spacing.xl,
  },
  testKnowledgeButton: {
    marginVertical: theme.spacing.md,
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
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
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
    marginTop: theme.spacing.xs,
  },
  planDays: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    marginTop: theme.spacing.xs,
  },
  versionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  versionOptionSelected: {
    backgroundColor: theme.colors.background.lightBlue,
    borderWidth: 2,
    borderColor: theme.colors.primary.royalBlue,
  },
  versionOptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  versionOptionTextSelected: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.royalBlue,
  },
});

export default BibleReaderScreen;

