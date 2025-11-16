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

const PLAN_TEMPLATES = [
  {
    id: 1,
    title: 'Gospel of John',
    description: 'Explore the life and teachings of Jesus',
    total_days: 10,
    icon: 'book',
    color: theme.colors.primary.royalBlue,
  },
  {
    id: 2,
    title: 'Overcoming Anxiety',
    description: 'Find peace through scripture',
    total_days: 7,
    icon: 'heart',
    color: theme.colors.secondary.sageGreen,
  },
  {
    id: 3,
    title: 'Proverbs Wisdom',
    description: 'Daily wisdom for life',
    total_days: 14,
    icon: 'bulb',
    color: theme.colors.primary.warmGold,
  },
  {
    id: 4,
    title: 'New Believer Basics',
    description: 'Foundation for your faith journey',
    total_days: 21,
    icon: 'star',
    color: theme.colors.primary.royalBlue,
  },
];

const ReadingPlansScreen = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    if (!user) return;

    const { data } = await getReadingPlans(user.id);
    setPlans(data || []);

    // Find active plan
    const active = data?.find((p) => p.is_active && !p.completed_at);
    setActivePlan(active);
  };

  const handleStartPlan = async (template) => {
    if (!user) return;

    const { data } = await createReadingPlan(user.id, {
      plan_type: template.title.toLowerCase().replace(/\s+/g, '_'),
      title: template.title,
      description: template.description,
      total_days: template.total_days,
      current_day: 0,
      is_active: true,
    });

    if (data) {
      loadPlans();
    }
  };

  const getProgress = (plan) => {
    if (!plan) return 0;
    return (plan.current_day / plan.total_days) * 100;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Active Plan */}
      {activePlan && (
        <Card style={styles.activePlanCard} variant="lightBlue">
          <View style={styles.activePlanHeader}>
            <View style={styles.activePlanInfo}>
              <Text style={styles.activePlanLabel}>Active Plan</Text>
              <Text style={styles.activePlanTitle}>{activePlan.title}</Text>
              <Text style={styles.activePlanDays}>
                Day {activePlan.current_day} of {activePlan.total_days}
              </Text>
            </View>

            <ProgressCircle
              progress={getProgress(activePlan)}
              size={80}
              strokeWidth={8}
              color={theme.colors.secondary.sageGreen}
            >
              <Text style={styles.progressText}>
                {Math.round(getProgress(activePlan))}%
              </Text>
            </ProgressCircle>
          </View>

          <Button
            title="Continue Reading"
            onPress={() => {}}
            style={styles.continueButton}
            icon={<Ionicons name="book-outline" size={20} color={theme.colors.primary.pureWhite} />}
          />
        </Card>
      )}

      {/* Available Plans */}
      <Text style={styles.sectionTitle}>
        {activePlan ? 'More Reading Plans' : 'Start a Reading Plan'}
      </Text>

      {PLAN_TEMPLATES.map((template) => (
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
});

export default ReadingPlansScreen;
