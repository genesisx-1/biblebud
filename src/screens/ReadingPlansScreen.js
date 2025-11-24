import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ProgressCircle } from '../components';
import { useAuth } from '../hooks/useAuth';
import { getReadingPlans, createReadingPlan } from '../services/supabase';
import theme from '../constants/theme';
import { READING_PLANS, getCategories } from '../constants/readingPlans';

const ReadingPlansScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const successScaleAnim = React.useRef(new Animated.Value(0)).current;
  const successOpacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    if (!user) return;

    const { data } = await getReadingPlans(user.id);
    setPlans(data || []);

    // Find all active plans
    const active = data?.filter((p) => p.is_active && !p.completed_at) || [];
    setActivePlans(active);
  };

  const handleContinueReading = (plan) => {
    if (!plan || !navigation) return;
    
    // Navigate to Home tab, then to BibleReading screen
    navigation.navigate('Home', {
      screen: 'BibleReading',
      params: {
        readingPlan: {
          plan_type: plan.plan_type,
          current_day: plan.current_day,
          total_days: plan.total_days,
          title: plan.title,
        },
      },
    });
  };

  const showSuccessMessage = (title) => {
    setNewPlanTitle(title);
    setShowSuccessAnimation(true);
    successScaleAnim.setValue(0);
    successOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(successScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide after 2.5 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(successScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessAnimation(false);
      });
    }, 2500);
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
      await loadPlans();
      showSuccessMessage(template.title);
      
      // Navigate to reading after a short delay
      setTimeout(() => {
        handleContinueReading(data);
      }, 1500);
    }
  };

  const getProgress = (plan) => {
    if (!plan) return 0;
    return (plan.current_day / plan.total_days) * 100;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Active Plans Section */}
        {activePlans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {activePlans.length === 1 ? 'Active Plan' : 'Active Plans'}
            </Text>
            {activePlans.map((plan) => (
              <Card key={plan.id} style={styles.activePlanCard} variant="lightBlue">
                <View style={styles.activePlanHeader}>
                  <View style={styles.activePlanInfo}>
                    <Text style={styles.activePlanTitle}>{plan.title}</Text>
                    <Text style={styles.activePlanDays}>
                      Day {plan.current_day} of {plan.total_days}
                    </Text>
                  </View>

                  <ProgressCircle
                    progress={getProgress(plan)}
                    size={70}
                    strokeWidth={7}
                    color={theme.colors.secondary.sageGreen}
                  >
                    <Text style={styles.progressText}>
                      {Math.round(getProgress(plan))}%
                    </Text>
                  </ProgressCircle>
                </View>

                <Button
                  title="Continue Reading"
                  onPress={() => handleContinueReading(plan)}
                  style={styles.continueButton}
                  icon={<Ionicons name="book-outline" size={20} color={theme.colors.primary.pureWhite} />}
                />
              </Card>
            ))}
          </>
        )}

        {/* Available Plans */}
        <Text style={styles.sectionTitle}>
          {activePlans.length > 0 ? 'More Reading Plans' : 'Start a Reading Plan'}
        </Text>
        <Text style={styles.planCount}>{READING_PLANS.length} Reading Plans Available</Text>

        {READING_PLANS.map((template) => (
          <PlanCard
            key={template.id}
            template={template}
            onStart={() => handleStartPlan(template)}
          />
        ))}

        {/* Completed Plans */}
        {plans.filter((p) => p.completed_at).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed Plans</Text>
            {plans
              .filter((p) => p.completed_at)
              .map((plan) => (
                <Card key={plan.id} style={styles.completedPlan}>
                  <View style={styles.completedPlanHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={32}
                      color={theme.colors.secondary.sageGreen}
                    />
                    <View style={styles.completedPlanInfo}>
                      <Text style={styles.completedPlanTitle}>{plan.title}</Text>
                      <Text style={styles.completedPlanDate}>
                        Completed {new Date(plan.completed_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
          </>
        )}
      </ScrollView>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <Animated.View 
          style={[
            styles.successOverlay,
            {
              opacity: successOpacityAnim,
              transform: [{ scale: successScaleAnim }],
            },
          ]}
        >
          <View style={styles.successCard}>
            <Ionicons 
              name="checkmark-circle" 
              size={60} 
              color={theme.colors.secondary.sageGreen} 
            />
            <Text style={styles.successTitle}>Plan Started!</Text>
            <Text style={styles.successSubtitle}>{newPlanTitle}</Text>
            <Text style={styles.successMessage}>Taking you to your reading...</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const PlanCard = ({ template, onStart }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={[styles.planIcon, { backgroundColor: template.color }]}>
              <Ionicons name={template.icon} size={28} color={theme.colors.primary.pureWhite} />
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{template.title}</Text>
              <Text style={styles.planDescription}>{template.description}</Text>
              <Text style={styles.planDuration}>
                <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />{' '}
                {template.total_days} days
              </Text>
            </View>
          </View>

          <Button
            title="Start Plan"
            variant="outline"
            size="small"
            onPress={onStart}
            style={styles.startButton}
          />
        </Card>
      </TouchableOpacity>
    </Animated.View>
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
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  activePlanCard: {
    padding: theme.spacing.lg,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  activePlanInfo: {
    flex: 1,
  },
  activePlanLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  activePlanTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  activePlanDays: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.royalBlue,
    marginTop: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.royalBlue,
  },
  continueButton: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  planCard: {
    padding: theme.spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  planDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  planDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  startButton: {
    marginTop: theme.spacing.sm,
  },
  completedPlan: {
    padding: theme.spacing.md,
  },
  completedPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  completedPlanInfo: {
    flex: 1,
  },
  completedPlanTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  completedPlanDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  planCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    backgroundColor: theme.colors.primary.pureWhite,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  successSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.royalBlue,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default ReadingPlansScreen;
