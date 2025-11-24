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

const PrivacyPolicyScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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

          <Text style={styles.intro}>
            Bible Bud ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>

          <Text style={styles.subTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            When you register for an account, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Email address</Text>
          <Text style={styles.bulletPoint}>• Name (optional)</Text>
          <Text style={styles.bulletPoint}>• Profile preferences (Bible translation, study times)</Text>

          <Text style={styles.subTitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain information about your device and how you interact with our App:
          </Text>
          <Text style={styles.bulletPoint}>• Reading history and progress</Text>
          <Text style={styles.bulletPoint}>• Quiz scores and achievements</Text>
          <Text style={styles.bulletPoint}>• Chat conversation history</Text>
          <Text style={styles.bulletPoint}>• Device information and IP address</Text>
          <Text style={styles.bulletPoint}>• App usage statistics</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information for:
          </Text>
          <Text style={styles.bulletPoint}>• Providing and maintaining the App</Text>
          <Text style={styles.bulletPoint}>• Personalizing your Bible study experience</Text>
          <Text style={styles.bulletPoint}>• Tracking your reading progress and streaks</Text>
          <Text style={styles.bulletPoint}>• Sending you personalized daily verses and notifications</Text>
          <Text style={styles.bulletPoint}>• Improving our services and developing new features</Text>
          <Text style={styles.bulletPoint}>• Analyzing usage patterns to enhance user experience</Text>

          <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            We use Supabase, a secure cloud database provider, to store your data. We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </Text>
          <Text style={styles.paragraph}>
            However, please note that no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
          </Text>

          <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Bible Bud may use third-party services that collect information:
          </Text>
          <Text style={styles.bulletPoint}>• Supabase (database and authentication)</Text>
          <Text style={styles.bulletPoint}>• Bible API services (for scripture content)</Text>
          <Text style={styles.bulletPoint}>• AI services (for chat and content generation)</Text>
          <Text style={styles.bulletPoint}>• Text-to-speech services</Text>

          <Text style={styles.paragraph}>
            These third parties have their own privacy policies. We encourage you to review their privacy policies.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• To protect and defend our rights or property</Text>
          <Text style={styles.bulletPoint}>• To prevent or investigate possible wrongdoing</Text>

          <Text style={styles.sectionTitle}>6. Your Data Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal data</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Export your data</Text>
          <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>

          <Text style={styles.paragraph}>
            To exercise these rights, please contact us through the Help & Support section.
          </Text>

          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Bible Bud is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
          </Text>

          <Text style={styles.sectionTitle}>8. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information only as long as necessary to provide you with our services and as described in this Privacy Policy. We will also retain and use your information to comply with our legal obligations, resolve disputes, and enforce our agreements.
          </Text>

          <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us through the Help & Support section in the app.
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
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.md * 1.6,
    marginBottom: theme.spacing.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.royalBlue,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
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

export default PrivacyPolicyScreen;
