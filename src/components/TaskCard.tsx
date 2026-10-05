
import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Task } from '../../types/task';

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
};

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        task.completed && styles.completedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <TouchableOpacity
        style={styles.check}
        onPress={onToggle}
      >
        <Ionicons
          name={
            task.completed
              ? 'checkmark-circle'
              : 'ellipse-outline'
          }
          size={28}
          color={
            task.completed
              ? '#126EED'
              : '#AAB0B8'
          }
        />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            task.completed && styles.completedTitle,
          ]}
        >
          {task.title}
        </Text>

        <View style={styles.details}>

          <Text style={styles.category}>
            {task.category}
          </Text>

          <Text style={styles.dot}>
            •
          </Text>

          <Text style={styles.time}>
            {task.time}
          </Text>

          {task.reminderEnabled && (
            <>
              <Text style={styles.dot}>
                •
              </Text>

              <Ionicons
                name="notifications-outline"
                size={14}
                color="#126EED"
              />
            </>
          )}

        </View>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
      >
        <Ionicons
          name="trash-outline"
          size={19}
          color="#E74C3C"
        />
      </TouchableOpacity>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  completedCard: {
    opacity: 0.65,
  },

  check: {
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  completedTitle: {
    textDecorationLine: 'line-through',
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  category: {
    color: '#126EED',
    fontSize: 12,
    fontWeight: '600',
  },

  dot: {
    marginHorizontal: 6,
    color: '#AAA',
  },

  time: {
    color: '#777',
    fontSize: 12,
  },

  deleteButton: {
    padding: 5,
  },
});

