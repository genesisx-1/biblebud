import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../components';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, signOut } from '../services/supabase';
import theme from '../constants/theme';

const ProfileScreen = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bibleTranslation, setBibleTranslation] = useState('NIV');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await getProfile(user.id);
    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
      setBibleTranslation(data.bible_translation || 'NIV');
    }
  };

  const handleSave = async () => {
    const { error } = await updateProfile(user.id, {
      full_name: fullName,
      bible_translation: bibleTranslation,
    });

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully');
    setEditing(false);
    loadProfile();
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation handled by useAuth hook
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={theme.colors.primary.pureWhite} />
          </View>
        </View>

        {editing ? (
          <>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />

            <View style={styles.translationContainer}>
              <Text style={styles.label}>Bible Translation</Text>
              <View style={styles.translationOptions}>
                {['NIV', 'KJV', 'ESV', 'NLT'].map((trans) => (
                  <TouchableOpacity
                    key={trans}
                    style={[
                      styles.translationOption,
                      bibleTranslation === trans && styles.translationOptionSelected,
                    ]}
                    onPress={() => setBibleTranslation(trans)}
                  >
                    <Text
                      style={[
                        styles.translationText,
                        bibleTranslation === trans && styles.translationTextSelected,
                      ]}
                    >
                      {trans}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditing(false)}
                style={styles.button}
              />
              <Button
                title="Save"
                onPress={handleSave}
                style={styles.button}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <Button
              title="Edit Profile"
              variant="outline"
              onPress={() => setEditing(true)}
              style={styles.editButton}
              icon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.royalBlue} />}
            />
          </>
        )}
      </Card>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Journey</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={32} color={theme.colors.primary.warmGold} />
            <Text style={styles.statValue}>{profile?.streak_count || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="book" size={32} color={theme.colors.primary.royalBlue} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Plans Completed</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="chatbubbles" size={32} color={theme.colors.secondary.sageGreen} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
        </View>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="language-outline" size={24} color={theme.colors.text.primary} />
            <Text style={styles.settingText}>Bible Translation</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{profile?.bible_translation || 'NIV'}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* About */}
      <Card style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About Bible Bro</Text>

        <TouchableOpacity style={styles.aboutItem}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.text.primary} />
          <Text style={styles.aboutText}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aboutItem}>
          <Ionicons name="document-text-outline" size={24} color={theme.colors.text.primary} />
          <Text style={styles.aboutText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aboutItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.text.primary} />
          <Text style={styles.aboutText}>Privacy Policy</Text>
        </TouchableOpacity>
      </Card>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOutButton}
        icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.semantic.error} />}
        textStyle={{ color: theme.colors.semantic.error }}
      />

      <Text style={styles.version}>Version 1.0.0</Text>
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
  profileCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    minWidth: 150,
  },
  input: {
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  translationContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  translationOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  translationOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
  },
  translationOptionSelected: {
    borderColor: theme.colors.primary.royalBlue,
    backgroundColor: theme.colors.background.lightBlue,
  },
  translationText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  translationTextSelected: {
    color: theme.colors.primary.royalBlue,
    fontWeight: theme.typography.fontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  statsCard: {
    padding: theme.spacing.lg,
  },
  statsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  settingsCard: {
    padding: theme.spacing.lg,
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  aboutCard: {
    padding: theme.spacing.lg,
  },
  aboutTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  aboutText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  signOutButton: {
    marginTop: theme.spacing.md,
    borderColor: theme.colors.semantic.error,
  },
  version: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.light,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default ProfileScreen;
