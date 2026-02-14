import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components';
import { getBibleVerse, getDailyReadingVerse, getReadingPlanVerse, getProfile, updateProfile, updateReadingPlanProgress } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import * as Speech from '../services/tts';
import theme from '../constants/theme';

const BIBLE_VERSIONS = [
  { code: 'NIV', name: 'New International Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'KJV', name: 'King James Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
];

const BibleReadingScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [verseData, setVerseData] = useState(null);
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('NIV');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [readingPlan, setReadingPlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    const plan = route?.params?.readingPlan;
    if (plan) {
      setReadingPlan(plan);
      setCurrentDay(plan.current_day || 0);
      navigation.setOptions({
        title: plan.title || 'Reading Plan',
      });
    }
    loadUserPreferences();
  }, [route?.params]);

  useEffect(() => {
    if (selectedVersion) {
      if (readingPlan) {
        loadReadingPlanVerse();
      } else {
        loadDailyReading();
      }
    }
  }, [selectedVersion, readingPlan, currentDay]);

  const loadUserPreferences = async () => {
    if (!user) {
      loadDailyReading();
      return;
    }
    const { data: profile } = await getProfile(user.id);
    if (profile?.bible_translation) {
      setSelectedVersion(profile.bible_translation);
    } else {
      loadDailyReading();
    }
  };

  const loadReadingPlanVerse = async () => {
    if (!readingPlan) return;

    setLoading(true);
    setVerseText('');

    try {
      const planVerse = getReadingPlanVerse(readingPlan.plan_type, currentDay, selectedVersion);

      if (!planVerse) {
        setLoading(false);
        return;
      }

      const verseParts = planVerse.verses.split('-');
      const startVerse = parseInt(verseParts[0]);
      const endVerse = verseParts[1] ? parseInt(verseParts[1]) : startVerse;

      let fullText = '';
      for (let v = startVerse; v <= endVerse; v++) {
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
    } catch (error) {
      console.error('Error loading reading plan verse:', error);
      setVerseText('Error loading verse. Please try again.');
    }

    setLoading(false);
  };

  const loadDailyReading = async () => {
    setLoading(true);
    setVerseText('');
    try {
      const { data, error } = await getDailyReadingVerse(selectedVersion);
      if (error) {
        console.error('Error fetching daily reading:', error);
      }

      if (data && data.text) {
        setVerseData(data);
        setVerseText(data.text);
      } else if (data) {
        setVerseData(data);
        const fallbackText = getFallbackVerseText(data.reference);
        setVerseText(fallbackText);
      } else {
        const fallback = {
          book: 'Jeremiah',
          chapter: 29,
          verse: 11,
          reference: 'Jeremiah 29:11',
        };
        setVerseData(fallback);
        setVerseText(getFallbackVerseText('Jeremiah 29:11'));
      }
    } catch (error) {
      console.error('Error loading daily reading:', error);
      const fallback = {
        book: 'Jeremiah',
        chapter: 29,
        verse: 11,
        reference: 'Jeremiah 29:11',
      };
      setVerseData(fallback);
      setVerseText(getFallbackVerseText('Jeremiah 29:11'));
    }
    setLoading(false);
  };

  const getFallbackVerseText = (reference) => {
    const fallbackVerses = {
      'Jeremiah 29:11': "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      'Proverbs 3:5': "Trust in the Lord with all your heart, and do not lean on your own understanding.",
      'Philippians 4:13': "I can do all things through him who strengthens me.",
      'Isaiah 40:31': "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
      'Romans 8:28': "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
      'Joshua 1:9': "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
      'Matthew 6:33': "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
      'Psalm 23:1': "The Lord is my shepherd; I shall not want.",
      'John 3:16': "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
      '1 Corinthians 13:4': "Love is patient and kind; love does not envy or boast; it is not arrogant",
    };
    return fallbackVerses[reference] || `Read ${reference} in your Bible or Bible app.`;
  };

  const handleVersionChange = async (version) => {
    setSelectedVersion(version);
    setShowVersionModal(false);
    if (user) {
      await updateProfile(user.id, { bible_translation: version });
    }
    loadDailyReading();
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      await Speech.stop();
    } else {
      setIsSpeaking(true);
      const text = `${verseData?.reference || 'Daily Reading'}. ${verseText}`;
      await Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${verseText}"\n\n- ${verseData?.reference || 'Daily Reading'} (${selectedVersion})\n\nShared from Bible Bro`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.royalBlue} />
        <Text style={styles.loadingText}>Loading reading...</Text>
      </View>
    );
  }

  const currentVersion = BIBLE_VERSIONS.find(v => v.code === selectedVersion) || BIBLE_VERSIONS[0];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.headerCard}>
          <Text style={styles.dayLabel}>
            {readingPlan ? `${readingPlan.title}` : 'Daily Reading'}
          </Text>
          {readingPlan && (
            <Text style={styles.dayNumber}>Day {currentDay + 1} of {readingPlan.total_days}</Text>
          )}
          {verseData?.title && (
            <Text style={styles.verseTitle}>{verseData.title}</Text>
          )}
          <View style={styles.referenceRow}>
            <Text style={styles.reference}>
              {verseData?.reference || 'Loading...'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowVersionModal(true)}
              style={styles.versionPill}
            >
              <Text style={styles.versionPillText}>{selectedVersion}</Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.primary.royalBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verse Content */}
        <View style={styles.verseCard}>
          {verseText ? (
            <>
              <Text style={styles.verseText}>{verseText}</Text>
              {verseData?.reference && (
                <Text style={styles.referenceFooter}>
                  {verseData.reference} ({selectedVersion})
                </Text>
              )}
            </>
          ) : (
            <ActivityIndicator size="small" color={theme.colors.primary.royalBlue} />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleSpeak} style={styles.actionBtn}>
            <Ionicons
              name={isSpeaking ? 'stop-circle' : 'volume-medium'}
              size={22}
              color={theme.colors.primary.royalBlue}
            />
            <Text style={styles.actionBtnText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={22} color={theme.colors.primary.royalBlue} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        {readingPlan ? (
          <View style={styles.navigationButtons}>
            <Button
              title="Previous Day"
              onPress={() => {
                if (currentDay > 0) {
                  setCurrentDay(currentDay - 1);
                }
              }}
              disabled={currentDay === 0}
              variant="outline"
              style={styles.navButton}
            />
            <Button
              title={currentDay === readingPlan.total_days - 1 ? "Complete" : "Next Day"}
              onPress={async () => {
                if (currentDay < readingPlan.total_days - 1) {
                  const newDay = currentDay + 1;
                  setCurrentDay(newDay);
                  if (user) {
                    const { getReadingPlans } = await import('../services/supabase');
                    const { data: plans } = await getReadingPlans(user.id);
                    const plan = plans?.find(p => p.plan_type === readingPlan.plan_type && p.is_active);
                    if (plan) {
                      await updateReadingPlanProgress(plan.id, newDay);
                    }
                  }
                }
              }}
              disabled={currentDay === readingPlan.total_days - 1}
              style={styles.navButton}
            />
          </View>
        ) : (
          <Button
            title="Refresh Reading"
            onPress={loadDailyReading}
            variant="outline"
            style={styles.refreshButton}
            icon={<Ionicons name="refresh" size={20} color={theme.colors.primary.royalBlue} />}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  // Header
  headerCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  dayLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  verseTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: 8,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reference: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
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
  // Verse Card
  verseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
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
  // Action Row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
  },
  refreshButton: {
    marginBottom: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
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

export default BibleReadingScreen;
