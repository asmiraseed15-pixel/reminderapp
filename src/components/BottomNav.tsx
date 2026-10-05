import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  usePathname,
  useRouter,
} from 'expo-router';

type BottomNavProps = {
  active?: 'task' | 'calendar' | 'stats' | 'profile';
};

export default function BottomNav({
  active,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current =
    active ||
    (pathname.split('/').pop() as
      | 'task'
      | 'calendar'
      | 'stats'
      | 'profile');

  const items = [
    {
      name: 'task' as const,
      label: 'Tasks',
      icon: 'checkmark-circle-outline' as const,
      activeIcon: 'checkmark-circle' as const,
      route: '/task' as const,
    },
    {
      name: 'calendar' as const,
      label: 'Calendar',
      icon: 'calendar-outline' as const,
      activeIcon: 'calendar' as const,
      route: '/calendar' as const,
    },
    {
      name: 'stats' as const,
      label: 'Stats',
      icon: 'stats-chart-outline' as const,
      activeIcon: 'stats-chart' as const,
      route: '/stats' as const,
    },
    {
      name: 'profile' as const,
      label: 'Profile',
      icon: 'person-outline' as const,
      activeIcon: 'person' as const,
      route: '/profile' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const selected =
          current === item.name;

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() =>
              router.replace(item.route)
            }
          >
            <View
              style={[
                styles.iconBox,
                selected &&
                  styles.activeIconBox,
              ]}
            >
              <Ionicons
                name={
                  selected
                    ? item.activeIcon
                    : item.icon
                }
                size={23}
                color={
                  selected
                    ? '#126EED'
                    : '#8A8F98'
                }
              />
            </View>

            <Text
              style={[
                styles.label,
                selected &&
                  styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBox: {
    width: 42,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconBox: {
    backgroundColor: '#EAF3FF',
  },

  label: {
    fontSize: 11,
    marginTop: 4,
    color: '#8A8F98',
    fontWeight: '600',
  },

  activeLabel: {
    color: '#126EED',
    fontWeight: '800',
  },
});