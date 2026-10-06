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

  const openPage = (path: string) => {
    router.push(path as any);
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
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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

        {/* =========================
            HERO
        ========================= */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="checkmark-done"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.appName}>
            Smart Todo
          </Text>

          <Text style={styles.tagline}>
            Organize your day. Conquer your goals.
          </Text>

          <Text style={styles.heroDescription}>
            A simple and intelligent productivity app
            designed to help you manage tasks, set reminders,
            plan your day and stay focused on what matters.
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* =========================
            QUICK FEATURES
        ========================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Explore Smart Todo
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tap a feature to learn more
            </Text>
          </View>

          <Ionicons
            name="sparkles-outline"
            size={25}
            color="#126EED"
          />
        </View>

        {/* =========================
            MANAGE TASKS
        ========================= */}

        <FeatureCard
          icon="checkmark-circle-outline"
          title="Manage Tasks"
          description="Create, edit, complete and delete your daily tasks."
          iconBackground="#EAF2FF"
          onPress={() => openPage('/manage-tasks')}
        />

        {/* =========================
            SMART REMINDERS
        ========================= */}

        <FeatureCard
          icon="notifications-outline"
          title="Smart Reminders"
          description="Set reminders and never miss an important task."
          iconBackground="#FFF4E5"
          iconColor="#F59E0B"
          onPress={() => openPage('/smart-reminders')}
        />

        {/* =========================
            TRACK PROGRESS
        ========================= */}

        <FeatureCard
          icon="bar-chart-outline"
          title="Track Progress"
          description="Monitor completed tasks and understand your productivity."
          iconBackground="#EAFBF2"
          iconColor="#16A34A"
          onPress={() => openPage('/track-progress')}
        />

        {/* =========================
            ORGANIZE CATEGORIES
        ========================= */}

        <FeatureCard
          icon="folder-open-outline"
          title="Organize Categories"
          description="Keep Personal, Work and Errands tasks organized."
          iconBackground="#F3EFFF"
          iconColor="#8B5CF6"
          onPress={() => openPage('/organize-categories')}
        />

        {/* =========================
            CALENDAR PLANNING
        ========================= */}

        <FeatureCard
          icon="calendar-outline"
          title="Calendar Planning"
          description="Plan upcoming tasks and manage your schedule easily."
          iconBackground="#FFF0F3"
          iconColor="#EC4899"
          onPress={() => openPage('/calendar-planning')}
        />

        {/* =========================
            PERSONALIZE
        ========================= */}

        <FeatureCard
          icon="color-palette-outline"
          title="Personalize App"
          description="Customize your Smart Todo experience and preferences."
          iconBackground="#EAF7FF"
          iconColor="#0891B2"
          onPress={() => openPage('/personalize-app')}
        />

        {/* =========================
            HOW IT WORKS
        ========================= */}

        <Text style={styles.sectionTitle}>
          How Smart Todo Helps
        </Text>

        <View style={styles.stepsCard}>

          <Step
            number="01"
            icon="add-circle-outline"
            title="Add Your Tasks"
            description="Create tasks with dates, times, categories and notes."
          />

          <View style={styles.stepLine} />

          <Step
            number="02"
            icon="notifications-outline"
            title="Set Reminders"
            description="Choose when you want Smart Todo to remind you."
          />

          <View style={styles.stepLine} />

          <Step
            number="03"
            icon="checkmark-done-outline"
            title="Complete & Track"
            description="Finish tasks and monitor your productivity."
          />

        </View>

        {/* =========================
            MISSION
        ========================= */}

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
            simple, organized and stress-free. Instead of
            remembering everything, let Smart Todo remember
            it for you.
          </Text>
        </View>

        {/* =========================
            MOTIVATION
        ========================= */}

        <View style={styles.quoteCard}>
          <Ionicons
            name="sparkles"
            size={26}
            color="#FFFFFF"
          />

          <Text style={styles.quote}>
            "Small tasks completed consistently
            create big results."
          </Text>

          <Text style={styles.quoteAuthor}>
            — Smart Todo
          </Text>
        </View>

        {/* =========================
            FOOTER
        ========================= */}

        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons
              name="checkmark-done"
              size={22}
              color="#126EED"
            />
          </View>

          <Text style={styles.footerTitle}>
            Smart Todo
          </Text>

          <Text style={styles.footerText}>
            Stay organized. Stay focused. Stay productive.
          </Text>

          <Text style={styles.copyright}>
            © 2026 Smart Todo
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   FEATURE CARD
===================================================== */

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

/* =====================================================
   STEP
===================================================== */

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

/* =====================================================
   STYLES
===================================================== */

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
    elevation: 4,
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
    fontSize: 29,
    fontWeight: '900',
  },

  tagline: {
    color: '#EAF2FF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },

  heroDescription: {
    color: '#EAF2FF',
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 16,
  },

  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 18,
  },

  versionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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