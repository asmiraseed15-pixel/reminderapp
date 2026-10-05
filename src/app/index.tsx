
import React from 'react';

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  const handleBegin = async () => {
    try {
      const onboardingCompleted =
        await AsyncStorage.getItem('onboarding_completed');

      if (onboardingCompleted === 'true') {
        // Onboarding already completed
        router.replace('/task');
      } else {
        // First time user
        router.replace('/onboarding');
      }
    } catch (error) {
      console.log(
        'Error checking onboarding status:',
        error
      );

      // If there is any error,
      // open onboarding safely
      router.replace('/onboarding');
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#F1F3F5', '#858A8E']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >

        {/* Front Image */}
        <Image
          source={require('../../assets/Front.png')}
          style={styles.star}
          resizeMode="contain"
        />

        {/* Tagline */}
        <Text style={styles.tagline}>
          Organize your day,{'\n'}
          Conquer your goal
        </Text>

        {/* Let's Begin Button */}
        <TouchableOpacity
          style={styles.beginButton}
          onPress={handleBegin}
          activeOpacity={0.8}
        >
          <Text style={styles.beginText}>
            Let's Begin
          </Text>
        </TouchableOpacity>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  star: {
    width: 250,
    height: 150,
    marginBottom: 25,
  },

  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.3,
  },

  beginButton: {
    marginTop: 35,
    minWidth: 170,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,

    backgroundColor: '#1b21cd',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  beginText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});