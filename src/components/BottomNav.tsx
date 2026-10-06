import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  usePathname,
  useRouter,
} from 'expo-router';

type BottomNavProps = {
  active?:
    | 'task'
    | 'calendar'
    | 'health'
    | 'finance'
    | 'profile';
};

export default function BottomNav({
  active,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  /*
   * Detect currently active page
   */
  const current =
    active ||
    (pathname.includes('calendar')
      ? 'calendar'
      : pathname.includes('health')
        ? 'health'
        : pathname.includes('finance')
          ? 'finance'
          : pathname.includes('profile')
            ? 'profile'
            : 'task');

  /*
   * Bottom navigation items
   */
  const items = [
    {
      name: 'task' as const,
      label: 'Tasks',

      icon: 'checkmark-circle-outline' as const,
      activeIcon: 'checkmark-circle' as const,

      route: '/task',

      color: '#126EED',
      background: '#EAF3FF',
    },

    {
      name: 'calendar' as const,
      label: 'Calendar',

      icon: 'calendar-outline' as const,
      activeIcon: 'calendar' as const,

      route: '/calendar-planning',

      color: '#8B5CF6',
      background: '#F1EAFE',
    },

    {
      name: 'health' as const,
      label: 'Health',

      icon: 'heart-outline' as const,
      activeIcon: 'heart' as const,

      route: '/health-fitness',

      color: '#EF476F',
      background: '#FFE8EF',
    },

    {
      name: 'finance' as const,
      label: 'Finance',

      icon: 'wallet-outline' as const,
      activeIcon: 'wallet' as const,

      route: '/finance',

      color: '#10B981',
      background: '#E6FAF3',
    },

    {
      name: 'profile' as const,
      label: 'Profile',

      icon: 'person-outline' as const,
      activeIcon: 'person' as const,

      route: '/profile',

      color: '#F59E0B',
      background: '#FFF4D9',
    },
  ];

  /*
   * Navigate to selected page
   */
  const handleNavigation = (route: string) => {
    if (pathname === route) {
      return;
    }

    router.push(route as any);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          width >= 900 && styles.desktopContainer,
        ]}
      >
        {items.map((item) => {
          const selected =
            current === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.item,
                width >= 900 &&
                  styles.desktopItem,
              ]}
              activeOpacity={0.75}
              onPress={() =>
                handleNavigation(item.route)
              }
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconBox,

                  selected && {
                    backgroundColor:
                      item.background,
                  },
                ]}
              >
                <Ionicons
                  name={
                    selected
                      ? item.activeIcon
                      : item.icon
                  }
                  size={24}
                  color={
                    selected
                      ? item.color
                      : '#9AA0AA'
                  }
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,

                  selected && {
                    color: item.color,
                    fontWeight: '800',
                  },
                ]}
              >
                {item.label}
              </Text>

              {/* Active Indicator */}
              {selected && (
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor:
                        item.color,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/*
 * Styles
 */

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E9EDF3',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 8,
  },

  container: {
    height: 82,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 5,

    paddingBottom: 7,
  },

  desktopContainer: {
    maxWidth: 900,

    width: '100%',

    alignSelf: 'center',
  },

  item: {
    flex: 1,

    minWidth: 60,

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',
  },

  desktopItem: {
    maxWidth: 160,
  },

  iconBox: {
    width: 46,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 11,

    marginTop: 4,

    color: '#8A8F98',

    fontWeight: '600',
  },

  activeDot: {
    position: 'absolute',

    bottom: -5,

    width: 5,
    height: 5,

    borderRadius: 3,
  },
});