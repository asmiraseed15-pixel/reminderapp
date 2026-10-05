
import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import { useTheme } from '../context/ThemeContext';

export default function AboutTodo() {

  const router = useRouter();

  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color={colors.text}
          />

        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
            },
          ]}
        >
          About Todo
        </Text>

        <View style={styles.rightSpace} />

      </View>


      {/* CONTENT */}

      <View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
          },
        ]}
      >

        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                colors.primaryLight,
            },
          ]}
        >

          <Ionicons
            name="checkmark-done"
            size={50}
            color={colors.primary}
          />

        </View>


        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Todo Reminder
        </Text>


        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Organize your day, manage your
          tasks and never forget an important
          reminder.
        </Text>


        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
              },
            ]}
          >
            About this app
          </Text>

          <Text
            style={[
              styles.cardText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Todo Reminder helps you create
            tasks, organize them into
            categories, set dates and times,
            save important tasks and track
            completed tasks.
          </Text>

        </View>


        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >

          <Ionicons
            name="arrow-back"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.buttonText}>
            Back to Profile
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  header: {
    height: 62,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,

    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  backButton: {
    width: 45,
    height: 45,

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,

    textAlign: 'center',

    fontSize: 19,
    fontWeight: '800',
  },

  rightSpace: {
    width: 45,
  },

  content: {
    flex: 1,

    alignItems: 'center',

    paddingHorizontal: 20,
    paddingTop: 45,
  },

  iconBox: {
    width: 100,
    height: 100,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',

    marginTop: 20,
  },

  description: {
    fontSize: 14,

    textAlign: 'center',

    lineHeight: 21,

    marginTop: 10,

    maxWidth: 340,
  },

  card: {
    width: '100%',

    borderRadius: 20,

    padding: 20,

    marginTop: 30,

    borderWidth: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',

    marginBottom: 10,
  },

  cardText: {
    fontSize: 14,

    lineHeight: 22,
  },

  button: {
    marginTop: 25,

    paddingHorizontal: 22,
    paddingVertical: 13,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 14,
    fontWeight: '800',
  },

});

