import React, {
  useRef,
  useState,
} from 'react';

import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

type OnboardingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    icon: 'calendar-outline',
    title: 'Plan Your Day',
    description:
      'Organize your tasks and keep everything in one simple place.',
  },
  {
    id: '2',
    icon: 'notifications-outline',
    title: 'Never Miss a Reminder',
    description:
      'Set dates, times and reminders for the things that matter.',
  },
  {
    id: '3',
    icon: 'checkmark-done-outline',
    title: 'Get Things Done',
    description:
      'Stay focused, complete your tasks and build a better routine.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const flatListRef =
    useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  // =====================================================
  // NEXT / GET STARTED
  // =====================================================

  const handleNext = async () => {
    if (
      currentIndex <
      onboardingData.length - 1
    ) {
      const nextIndex =
        currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);

      return;
    }

    await completeOnboarding();
  };

  // =====================================================
  // SKIP
  // =====================================================

  const handleSkip = async () => {
    await completeOnboarding();
  };

  // =====================================================
  // COMPLETE ONBOARDING
  // =====================================================

  const completeOnboarding =
    async () => {
      try {
        await AsyncStorage.setItem(
          'onboarding_completed',
          'true'
        );

        router.replace('/task');
      } catch (error) {
        console.log(
          'Onboarding save error:',
          error
        );

        router.replace('/task');
      }
    };

  // =====================================================
  // SCROLL
  // =====================================================

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / width
    );

    if (
      index >= 0 &&
      index < onboardingData.length
    ) {
      setCurrentIndex(index);
    }
  };

  // =====================================================
  // RENDER SLIDE
  // =====================================================

  const renderItem = ({
    item,
  }: {
    item: OnboardingItem;
  }) => {
    return (
      <View style={styles.slide}>

        {/* Decorative background */}

        <View
          style={styles.blueOrb}
        />

        <View
          style={styles.cyanOrb}
        />

        {/* Icon */}

        <View style={styles.iconOuter}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={item.icon}
              size={75}
              color="#126EED"
            />
          </View>
        </View>

        {/* Small decorative dots */}

        <View style={styles.dotOne} />
        <View style={styles.dotTwo} />
        <View style={styles.dotThree} />

        {/* Title */}

        <Text style={styles.title}>
          {item.title}
        </Text>

        {/* Description */}

        <Text style={styles.description}>
          {item.description}
        </Text>

      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          TOP BAR
      ================================================= */}

      <View style={styles.topBar}>

        <Text style={styles.logo}>
          TaskFlow
        </Text>

        {currentIndex <
          onboardingData.length - 1 ? (
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skip}>
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

      </View>

      {/* =================================================
          SLIDES
      ================================================= */}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.id
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        getItemLayout={(
          _data,
          index
        ) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* =================================================
          BOTTOM SECTION
      ================================================= */}

      <View style={styles.bottomSection}>

        {/* Progress dots */}

        <View style={styles.pagination}>
          {onboardingData.map(
            (_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index ===
                    currentIndex &&
                    styles.activeDot,
                ]}
              />
            )
          )}
        </View>

        {/* Button */}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {currentIndex ===
            onboardingData.length - 1
              ? 'Get Started'
              : 'Continue'}
          </Text>

          <Ionicons
            name={
              currentIndex ===
              onboardingData.length - 1
                ? 'checkmark'
                : 'arrow-forward'
            }
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Bottom text */}

        <Text style={styles.bottomText}>
          Stay organized. Stay focused.
        </Text>

      </View>

    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // =====================================================
  // TOP BAR
  // =====================================================

  topBar: {
    height: 65,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#126EED',
    letterSpacing: 0.3,
  },

  skip: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A8494',
  },

  // =====================================================
  // SLIDE
  // =====================================================

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    overflow: 'hidden',
  },

  // =====================================================
  // DECORATIVE ORBS
  // =====================================================

  blueOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor:
      'rgba(18, 110, 237, 0.07)',
    top: -80,
    right: -120,
  },

  cyanOrb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor:
      'rgba(55, 217, 255, 0.06)',
    bottom: -100,
    left: -120,
  },

  // =====================================================
  // ICON
  // =====================================================

  iconOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      'rgba(18, 110, 237, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45,
  },

  iconCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 8,

    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },

  // =====================================================
  // DECORATIVE DOTS
  // =====================================================

  dotOne: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#126EED',
    top: '27%',
    left: '18%',
  },

  dotTwo: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#37D9FF',
    top: '33%',
    right: '18%',
  },

  dotThree: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7E57FF',
    bottom: '30%',
    left: '23%',
  },

  // =====================================================
  // TEXT
  // =====================================================

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#7A8494',
    textAlign: 'center',
    maxWidth: 340,
  },

  // =====================================================
  // BOTTOM
  // =====================================================

  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 22,
    paddingTop: 10,
  },

  // =====================================================
  // PAGINATION
  // =====================================================

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D2D8E1',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 28,
    backgroundColor: '#126EED',
  },

  // =====================================================
  // BUTTON
  // =====================================================

  nextButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,

    elevation: 4,

    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // =====================================================
  // BOTTOM TEXT
  // =====================================================

  bottomText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A0A7B2',
    marginTop: 13,
  },

});