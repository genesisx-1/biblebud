import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

const TermsOfServiceScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary.pureWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
          <Text style={styles.lastUpdated}>Last Updated: November 24, 2025</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Bible Bud ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily use Bible Bud for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to decompile or reverse engineer any software in the App</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or other proprietary notations from the materials</Text>

          <Text style={styles.sectionTitle}>3. Disclaimer</Text>
          <Text style={styles.paragraph}>
            Bible Bud is a Bible study and devotional application. The content, including biblical interpretations, devotionals, and spiritual guidance, is provided for informational and educational purposes only.
          </Text>
          <Text style={styles.paragraph}>
            The materials in Bible Bud are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Text>

          <Text style={styles.sectionTitle}>4. Religious Content</Text>
          <Text style={styles.paragraph}>
            Bible Bud provides Christian religious content. While we strive for accuracy, we do not claim to be a substitute for professional theological advice or pastoral counsel. For serious spiritual matters, please consult with qualified religious leaders or counselors.
          </Text>

          <Text style={styles.sectionTitle}>5. Limitations</Text>
          <Text style={styles.paragraph}>
            In no event shall Bible Bud or its developers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials in Bible Bud, even if Bible Bud or its authorized representative has been notified orally or in writing of the possibility of such damage.
          </Text>

          <Text style={styles.sectionTitle}>6. AI-Generated Content</Text>
          <Text style={styles.paragraph}>
            Bible Bud may use artificial intelligence to provide biblical insights, answer questions, and generate devotional content. AI-generated responses should be viewed as supplementary tools for Bible study and not as authoritative theological statements.
          </Text>

          <Text style={styles.sectionTitle}>7. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use Bible Bud to:
          </Text>
          <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Post or transmit any unlawful, threatening, abusive, or obscene material</Text>
          <Text style={styles.bulletPoint}>• Impersonate any person or entity</Text>
          <Text style={styles.bulletPoint}>• Interfere with or disrupt the App or servers</Text>

          <Text style={styles.sectionTitle}>8. Account Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account and access to Bible Bud immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by updating the "Last Updated" date of these Terms. Your continued use of the App following any changes constitutes acceptance of those changes.
          </Text>

          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us through the Help & Support section in the app.
          </Text>

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
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.md * 1.6,
    marginBottom: theme.spacing.md,
  },
  bulletPoint: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.md * 1.6,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});

export default TermsOfServiceScreen;
