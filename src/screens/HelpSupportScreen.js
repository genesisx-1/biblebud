import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import theme from '../constants/theme';

const FAQ_ITEMS = [
  {
    question: 'How do I start a reading plan?',
    answer: 'Go to the Bible Reader screen and tap on the "Plan" tab. Then select "Start a Plan" and choose from our curated reading plans.',
  },
  {
    question: 'Can I change my Bible translation?',
    answer: 'Yes! Go to your Profile, tap "Edit Profile", and select your preferred translation (NIV, KJV, ESV, or NLT).',
  },
  {
    question: 'How does the daily verse work?',
    answer: 'Every user gets a personalized daily verse that changes each day. Your verse is unique to you and selected from over 200+ inspirational Bible verses.',
  },
  {
    question: 'What is the streak counter?',
    answer: 'The streak counter tracks consecutive days you engage with Bible Bud. Reading, taking quizzes, or chatting will maintain your streak.',
  },
  {
    question: 'How do I use the AI chat feature?',
    answer: 'Tap the "Bible Bro" tab at the bottom. You can ask biblical questions, get devotional insights, or discuss scripture passages.',
  },
  {
    question: 'Can I read the Bible offline?',
    answer: 'Currently, Bible Bud requires an internet connection to fetch Bible content. Offline support is planned for a future update.',
  },
  {
    question: 'How do quizzes work?',
    answer: 'Tap "Bible Quiz" to test your knowledge. You can filter questions by book, chapter, or take a random quiz. Your scores and achievements are saved.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! We use Supabase for secure data storage with encryption. See our Privacy Policy for full details.',
  },
];

const HelpSupportScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to reach us:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@biblebud.app'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary.pureWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleContactSupport}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary.royalBlue }]}>
                <Ionicons name="mail" size={24} color={theme.colors.primary.pureWhite} />
              </View>
              <Text style={styles.actionTitle}>Contact Us</Text>
              <Text style={styles.actionSubtitle}>Get in touch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Linking.openURL('https://biblebud.app/feedback')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary.sageGreen }]}>
                <Ionicons name="chatbubbles" size={24} color={theme.colors.primary.pureWhite} />
              </View>
              <Text style={styles.actionTitle}>Feedback</Text>
              <Text style={styles.actionSubtitle}>Share ideas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Linking.openURL('https://biblebud.app/bugs')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary.warmGold }]}>
                <Ionicons name="bug" size={24} color={theme.colors.primary.pureWhite} />
              </View>
              <Text style={styles.actionTitle}>Report Bug</Text>
              <Text style={styles.actionSubtitle}>Help us improve</Text>
            </TouchableOpacity>
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {FAQ_ITEMS.map((item, index) => (
              <Card key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.primary.royalBlue}
                  />
                </TouchableOpacity>

                {expandedIndex === index && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>

          {/* App Info */}
          <Card style={styles.appInfoCard}>
            <Text style={styles.appInfoTitle}>Bible Bud</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            <Text style={styles.appInfoText}>
              Your personal Bible study companion
            </Text>
            <Text style={styles.appInfoCopyright}>
              © 2025 Bible Bud. All rights reserved.
            </Text>
          </Card>

          <View style={styles.spacer} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary.royalBlue,
    ...theme.shadows.medium,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.pureWhite,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  actionSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  faqSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  faqCard: {
    marginBottom: theme.spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  faqAnswerContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.sm * 1.5,
    marginTop: theme.spacing.sm,
  },
  appInfoCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  appInfoTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.royalBlue,
    marginBottom: theme.spacing.xs,
  },
  appInfoVersion: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  appInfoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  appInfoCopyright: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.light,
    marginTop: theme.spacing.md,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});

export default HelpSupportScreen;
