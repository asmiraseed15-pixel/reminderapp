import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 600;

  /*
   * =========================================================
   * OPEN PAGE
   * =========================================================
   */
  const openPage = (path: string) => {
    router.push(path as any);
  };

  /*
   * =========================================================
   * BACK BUTTON
   * =========================================================
   */
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/task' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          isTablet && styles.tabletContainer,
        ]}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            About Smart Todo
          </Text>

          <View style={styles.headerPlaceholder} />

        </View>

        {/* =====================================================
            HERO
        ===================================================== */}

        <View style={styles.heroCard}>

          <View style={styles.heroIcon}>
            <Ionicons
              name="sparkles"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.appName}>
            Smart Todo
          </Text>

          <Text style={styles.tagline}>
            Organize. Track. Grow. Achieve.
          </Text>

          <Text style={styles.heroDescription}>
            More than a Todo app — Smart Todo helps you
            manage tasks, reminders, health, fitness,
            finances and everyday productivity in one
            smart workspace.
          </Text>

          <View style={styles.badgeRow}>

            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                Version 2.0
              </Text>
            </View>

            <View style={styles.smartBadge}>

              <Ionicons
                name="flash"
                size={13}
                color="#126EED"
              />

              <Text style={styles.smartBadgeText}>
                Smart Life
              </Text>

            </View>

          </View>

        </View>

        {/* =====================================================
            PRODUCTIVITY
        ===================================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Productivity
            </Text>

            <Text style={styles.sectionSubtitle}>
              Everything you need to stay organized
            </Text>
          </View>

          <Ionicons
            name="sparkles-outline"
            size={25}
            color="#126EED"
          />

        </View>

        <FeatureCard
          icon="checkmark-circle-outline"
          title="Manage Tasks"
          description="Create, edit, complete and delete your daily tasks."
          iconBackground="#EAF2FF"
          iconColor="#126EED"
          onPress={() => openPage('/manage-tasks')}
        />

        <FeatureCard
          icon="notifications-outline"
          title="Smart Reminders"
          description="Set date and time reminders so you never miss important tasks."
          iconBackground="#FFF4E5"
          iconColor="#F59E0B"
          onPress={() => openPage('/smart-reminders')}
        />

        <FeatureCard
          icon="bar-chart-outline"
          title="Track Progress"
          description="Monitor completed tasks, pending work and productivity progress."
          iconBackground="#EAFBF2"
          iconColor="#16A34A"
          onPress={() => openPage('/track-progress')}
        />

        <FeatureCard
          icon="folder-open-outline"
          title="Organize Categories"
          description="Keep Personal, Work, Study, Health and Shopping tasks organized."
          iconBackground="#F3EFFF"
          iconColor="#8B5CF6"
          onPress={() => openPage('/organize-categories')}
        />

        <FeatureCard
          icon="calendar-outline"
          title="Calendar Planning"
          description="Plan your day, check upcoming tasks and manage your schedule."
          iconBackground="#FFF0F3"
          iconColor="#EC4899"
          onPress={() => openPage('/calendar-planning')}
        />

        <FeatureCard
          icon="color-palette-outline"
          title="Personalize App"
          description="Customize your profile, notifications, appearance and preferences."
          iconBackground="#EAF7FF"
          iconColor="#0891B2"
          onPress={() => openPage('/personalize-app')}
        />

        {/* =====================================================
            HEALTH & FITNESS
        ===================================================== */}

        <View style={styles.sectionHeaderHealth}>

          <View>
            <Text style={styles.sectionTitle}>
              Health & Fitness
            </Text>

            <Text style={styles.sectionSubtitle}>
              Turn your daily routine into a healthier lifestyle
            </Text>
          </View>

          <Ionicons
            name="fitness-outline"
            size={25}
            color="#16A34A"
          />

        </View>

        <FeatureCard
          icon="fitness-outline"
          title="Health & Fitness"
          description="Track daily activity, workouts, calories and healthy habits."
          iconBackground="#EAFBF2"
          iconColor="#16A34A"
          onPress={() => openPage('/health-fitness')}
        />

        <FeatureCard
          icon="walk-outline"
          title="Steps Counter"
          description="Track your daily walking steps and monitor your activity goals."
          iconBackground="#EAF7FF"
          iconColor="#0891B2"
          onPress={() => openPage('/health-fitness')}
        />

        <FeatureCard
          icon="flame-outline"
          title="Calories Burned"
          description="Estimate calories burned from your daily movement and workouts."
          iconBackground="#FFF1E8"
          iconColor="#F97316"
          onPress={() => openPage('/health-fitness')}
        />

        <FeatureCard
          icon="water-outline"
          title="Water Intake"
          description="Track your daily water intake and build a healthy hydration habit."
          iconBackground="#EAF7FF"
          iconColor="#0284C7"
          onPress={() => openPage('/health-fitness')}
        />

        {/* =====================================================
            FINANCE & MONEY
        ===================================================== */}

        <View style={styles.sectionHeaderFinance}>

          <View>
            <Text style={styles.sectionTitle}>
              Finance & Money
            </Text>

            <Text style={styles.sectionSubtitle}>
              Keep your daily spending organized
            </Text>
          </View>

          <Ionicons
            name="wallet-outline"
            size={25}
            color="#7C3AED"
          />

        </View>

        {/* FINANCE DASHBOARD */}

        <FeatureCard
          icon="wallet-outline"
          title="Finance Dashboard"
          description="View income, expenses, balance and your monthly financial overview."
          iconBackground="#F3EFFF"
          iconColor="#7C3AED"
          onPress={() => openPage('/finance')}
        />

        {/* EXPENSE TRACKER */}

        <FeatureCard
          icon="receipt-outline"
          title="Expense Tracker"
          description="Record your daily expenses and understand where your money goes."
          iconBackground="#FFF0F3"
          iconColor="#DB2777"
          onPress={() => openPage('/expense-tracker')}
        />

        {/* UPI & PAYMENTS */}

        <FeatureCard
          icon="phone-portrait-outline"
          title="UPI & Payments"
          description="Track GPay, PhonePe, Paytm and other UPI payment records."
          iconBackground="#EAF2FF"
          iconColor="#126EED"
          onPress={() => openPage('/finance')}
        />

        {/* SAVINGS GOALS */}

        <FeatureCard
          icon="trending-up-outline"
          title="Savings Goals"
          description="Set savings targets and track your progress toward financial goals."
          iconBackground="#EAFBF2"
          iconColor="#16A34A"
          onPress={() => openPage('/savings-goals')}
        />

        {/* =====================================================
            SMART INSIGHTS
        ===================================================== */}

        <View style={styles.sectionHeaderInsights}>

          <View>
            <Text style={styles.sectionTitle}>
              Smart Insights
            </Text>

            <Text style={styles.sectionSubtitle}>
              Understand your daily performance
            </Text>
          </View>

          <Ionicons
            name="analytics-outline"
            size={25}
            color="#EA580C"
          />

        </View>

        <FeatureCard
          icon="analytics-outline"
          title="Daily Insights"
          description="Get an overview of tasks, activity, expenses and daily productivity."
          iconBackground="#FFF4E5"
          iconColor="#EA580C"
          onPress={() => openPage('/daily-insights')}
        />

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <Text style={styles.howTitle}>
          How Smart Todo Helps
        </Text>

        <View style={styles.stepsCard}>

          <Step
            number="01"
            icon="add-circle-outline"
            title="Plan Your Day"
            description="Create tasks, schedules, reminders and personal goals."
          />

          <View style={styles.stepLine} />

          <Step
            number="02"
            icon="fitness-outline"
            title="Track Your Activity"
            description="Monitor steps, calories, water and healthy daily habits."
          />

          <View style={styles.stepLine} />

          <Step
            number="03"
            icon="wallet-outline"
            title="Manage Your Money"
            description="Track expenses, payments, savings and financial goals."
          />

          <View style={styles.stepLine} />

          <Step
            number="04"
            icon="analytics-outline"
            title="Understand Your Progress"
            description="See productivity, health and finance insights in one place."
          />

        </View>

        {/* =====================================================
            SMART LIFE DASHBOARD
        ===================================================== */}

        <View style={styles.smartLifeCard}>

          <View style={styles.smartLifeIcon}>
            <Ionicons
              name="sparkles"
              size={30}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.smartLifeTitle}>
            Your Smart Life Dashboard
          </Text>

          <Text style={styles.smartLifeText}>
            Tasks + Reminders + Fitness + Health + Finance
            + Insights — everything you need to organize
            your everyday life in one place.
          </Text>

          <View style={styles.smartLifeRow}>

            <MiniFeature
              icon="checkmark-circle"
              text="Tasks"
            />

            <MiniFeature
              icon="fitness"
              text="Health"
            />

            <MiniFeature
              icon="wallet"
              text="Finance"
            />

            <MiniFeature
              icon="analytics"
              text="Insights"
            />

          </View>

        </View>

        {/* =====================================================
            MISSION
        ===================================================== */}

        <View style={styles.missionCard}>

          <View style={styles.missionIcon}>
            <Ionicons
              name="bulb-outline"
              size={30}
              color="#126EED"
            />
          </View>

          <Text style={styles.missionTitle}>
            Our Mission
          </Text>

          <Text style={styles.missionText}>
            Smart Todo is built to make everyday planning
            simple, organized and meaningful. Instead of
            remembering everything, let Smart Todo help
            you manage it.
          </Text>

        </View>

        {/* =====================================================
            MOTIVATION
        ===================================================== */}

        <View style={styles.quoteCard}>

          <Ionicons
            name="sparkles"
            size={26}
            color="#FFFFFF"
          />

          <Text style={styles.quote}>
            "Plan your day. Track your progress.
            Improve your life."
          </Text>

          <Text style={styles.quoteAuthor}>
            — Smart Todo
          </Text>

        </View>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <View style={styles.footer}>

          <View style={styles.footerIcon}>
            <Ionicons
              name="sparkles"
              size={22}
              color="#126EED"
            />
          </View>

          <Text style={styles.footerTitle}>
            Smart Todo
          </Text>

          <Text style={styles.footerText}>
            Stay organized. Stay healthy. Stay financially smart.
          </Text>

          <Text style={styles.copyright}>
            © 2026 Smart Todo
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
  iconBackground,
  iconColor = '#126EED',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  iconBackground: string;
  iconColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={onPress}
      activeOpacity={0.75}
    >

      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={iconColor}
        />
      </View>

      <View style={styles.featureContent}>

        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>

      </View>

      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </View>

    </TouchableOpacity>
  );
}

/* =========================================================
   STEP
========================================================= */

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.step}>

      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons
          name={icon}
          size={24}
          color="#126EED"
        />
      </View>

      <View style={styles.stepContent}>

        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}

/* =========================================================
   MINI FEATURE
========================================================= */

function MiniFeature({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.miniFeature}>

      <Ionicons
        name={icon}
        size={18}
        color="#FFFFFF"
      />

      <Text style={styles.miniFeatureText}>
        {text}
      </Text>

    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 45,
  },

  tabletContainer: {
    paddingHorizontal: 60,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
  },

  headerPlaceholder: {
    width: 45,
  },

  /* HERO */

  heroCard: {
    backgroundColor: '#126EED',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 28,
    elevation: 5,
  },

  heroIcon: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  appName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },

  tagline: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },

  heroDescription: {
    color: '#EAF2FF',
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 700,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },

  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
  },

  versionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },

  smartBadgeText: {
    color: '#126EED',
    fontSize: 12,
    fontWeight: '900',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionHeaderHealth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 13,
  },

  sectionHeaderFinance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 13,
  },

  sectionHeaderInsights: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 13,
  },

  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 12.5,
    marginTop: -7,
    marginBottom: 12,
  },

  howTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 13,
  },

  /* FEATURE */

  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 82,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  featureIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  featureTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },

  featureDescription: {
    color: '#6B7280',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HOW IT WORKS */

  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 19,
    marginBottom: 20,
    elevation: 2,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumberText: {
    color: '#126EED',
    fontSize: 11,
    fontWeight: '900',
  },

  stepIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F1F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  stepContent: {
    flex: 1,
    marginLeft: 12,
  },

  stepTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },

  stepDescription: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  stepLine: {
    width: 1,
    height: 25,
    backgroundColor: '#D9E5F7',
    marginLeft: 50,
    marginVertical: 5,
  },

  /* SMART LIFE */

  smartLifeCard: {
    backgroundColor: '#111827',
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },

  smartLifeIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  smartLifeTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  smartLifeText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },

  smartLifeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 9,
    marginTop: 18,
  },

  miniFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 15,
  },

  miniFeatureText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* MISSION */

  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 23,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 2,
  },

  missionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  missionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
  },

  missionText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  /* QUOTE */

  quoteCard: {
    backgroundColor: '#126EED',
    borderRadius: 23,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },

  quote: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 10,
  },

  quoteAuthor: {
    color: '#DCEAFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    paddingTop: 5,
  },

  footerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  footerTitle: {
    color: '#126EED',
    fontSize: 17,
    fontWeight: '900',
  },

  footerText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  copyright: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 9,
  },

});