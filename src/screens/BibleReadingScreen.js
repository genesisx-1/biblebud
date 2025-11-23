import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { getBibleVerse, getDailyReadingVerse, getReadingPlanVerse, getProfile, updateProfile, updateReadingPlanProgress } from '../services/supabase';
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

  // Check for reading plan from route params
  useEffect(() => {
    const plan = route?.params?.readingPlan;
    if (plan) {
      setReadingPlan(plan);
      setCurrentDay(plan.current_day || 0);
      // Update navigation header
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
      // If no preference, still load reading with default NIV
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
      
      // Parse verse range (e.g., "1-18" or single "1")
      const verseParts = planVerse.verses.split('-');
      const startVerse = parseInt(verseParts[0]);
      const endVerse = verseParts[1] ? parseInt(verseParts[1]) : startVerse;
      
      // Fetch verses
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
    setVerseText(''); // Clear previous text
    try {
      const { data, error } = await getDailyReadingVerse(selectedVersion);
      if (error) {
        console.error('Error fetching daily reading:', error);
      }
      
      if (data && data.text) {
        setVerseData(data);
        setVerseText(data.text);
      } else if (data) {
        // If we have data but no text, use fallback
        setVerseData(data);
        const fallbackText = getFallbackVerseText(data.reference);
        setVerseText(fallbackText);
      } else {
        // Complete fallback
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
    // Save preference
    if (user) {
      await updateProfile(user.id, { bible_translation: version });
    }
    // Reload with new version
    loadDailyReading();
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      await speak.stop();
    } else {
      setIsSpeaking(true);
      const text = `${verseData?.reference || 'Daily Reading'}. ${verseText}`;
      await speak.speak(text, {
        onDone: () => setIsSpeaking(false),
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.royalBlue} />
        <Text style={styles.loadingText}>Loading daily reading...</Text>
      </View>
    );
  }

  const currentVersion = BIBLE_VERSIONS.find(v => v.code === selectedVersion) || BIBLE_VERSIONS[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dayLabel}>
              {readingPlan ? `${readingPlan.title} - Day ${currentDay + 1}` : 'Daily Reading'}
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

      <Card style={styles.verseCard}>
        {verseText ? (
          <>
            <Text style={styles.verseText}>{verseText}</Text>
            {verseData?.reference && (
              <Text style={styles.referenceFooter}>{verseData.reference} ({selectedVersion})</Text>
            )}
          </>
        ) : (
          <ActivityIndicator size="small" color={theme.colors.primary.royalBlue} />
        )}
      </Card>

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
                // Update progress in database
                if (user) {
                  // Find the plan ID and update it
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
          title="Refresh Today's Reading"
          onPress={loadDailyReading}
          variant="outline"
          style={styles.refreshButton}
          icon={<Ionicons name="refresh" size={20} color={theme.colors.primary.royalBlue} />}
        />
      )}

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
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  headerCard: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayLabel: {
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
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  reference: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  speakerButton: {
    padding: theme.spacing.xs,
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
  navigationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  navButton: {
    flex: 1,
  },
  headerLeft: {
    flex: 1,
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
  referenceFooter: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  refreshButton: {
    marginBottom: theme.spacing.xl,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  navButton: {
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

export default BibleReadingScreen;

