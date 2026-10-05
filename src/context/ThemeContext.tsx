import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Appearance,
  ColorSchemeName,
  useColorScheme,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


// =====================================================
// THEME TYPES
// =====================================================

export type ThemeMode = 'light' | 'dark' | 'system';


// =====================================================
// COLORS
// =====================================================

export const lightColors = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  primary: '#126EED',
  primaryLight: '#E8F1FF',
  primaryDark: '#0B56C4',

  text: '#172033',
  textSecondary: '#667085',
  textLight: '#98A2B3',

  border: '#E4E7EC',
  divider: '#EAECF0',

  success: '#12B76A',
  successLight: '#ECFDF3',

  warning: '#F79009',
  warningLight: '#FFFAEB',

  danger: '#F04438',
  dangerLight: '#FEF3F2',

  purple: '#7F56D9',
  purpleLight: '#F4EBFF',

  blue: '#2E90FA',
  blueLight: '#EFF8FF',

  orange: '#F79009',
  orangeLight: '#FFFAEB',

  pink: '#EC4899',
  pinkLight: '#FDF2F8',

  shadow: '#101828',

  inputBackground: '#F9FAFB',

  overlay: 'rgba(0,0,0,0.35)',
};


export const darkColors = {
  background: '#0B1120',
  surface: '#111827',
  card: '#182235',

  primary: '#4C9AFF',
  primaryLight: '#162B4A',
  primaryDark: '#7DB3FF',

  text: '#F8FAFC',
  textSecondary: '#B4BDCC',
  textLight: '#7F8A9F',

  border: '#293548',
  divider: '#253044',

  success: '#32D583',
  successLight: '#123525',

  warning: '#FDB022',
  warningLight: '#3A2B0D',

  danger: '#F97066',
  dangerLight: '#421A18',

  purple: '#9B8AFB',
  purpleLight: '#2A2146',

  blue: '#53B1FD',
  blueLight: '#102D45',

  orange: '#FDB022',
  orangeLight: '#3A2B0D',

  pink: '#F670C7',
  pinkLight: '#421F38',

  shadow: '#000000',

  inputBackground: '#151F31',

  overlay: 'rgba(0,0,0,0.65)',
};


// =====================================================
// COLOR TYPE
// =====================================================

export type ThemeColors = typeof lightColors;


// =====================================================
// CONTEXT TYPE
// =====================================================

interface ThemeContextType {
  mode: ThemeMode;

  theme: 'light' | 'dark';

  colors: ThemeColors;

  isDark: boolean;

  setTheme: (mode: ThemeMode) => Promise<void>;

  toggleTheme: () => Promise<void>;
}


// =====================================================
// CONTEXT
// =====================================================

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);


// =====================================================
// STORAGE KEY
// =====================================================

const THEME_STORAGE_KEY = '@todo_reminder_theme';


// =====================================================
// PROVIDER
// =====================================================

interface ThemeProviderProps {
  children: ReactNode;
}


export function ThemeProvider({
  children,
}: ThemeProviderProps) {

  // Current device theme
  const systemScheme = useColorScheme();

  // User selected theme
  const [mode, setMode] = useState<ThemeMode>('system');


  // ===================================================
  // LOAD SAVED THEME
  // ===================================================

  useEffect(() => {

    const loadTheme = async () => {

      try {

        const savedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );

        if (
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system'
        ) {

          setMode(savedTheme);

        }

      } catch (error) {

        console.log(
          'Error loading theme:',
          error
        );

      }

    };


    loadTheme();

  }, []);


  // ===================================================
  // RESOLVE CURRENT THEME
  // ===================================================

  const theme =
    mode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : mode;


  // ===================================================
  // DARK MODE CHECK
  // ===================================================

  const isDark = theme === 'dark';


  // ===================================================
  // SELECT COLORS
  // ===================================================

  const colors =
    isDark
      ? darkColors
      : lightColors;


  // ===================================================
  // SET THEME
  // ===================================================

  const setTheme = async (
    newMode: ThemeMode
  ) => {

    try {

      setMode(newMode);

      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        newMode
      );

    } catch (error) {

      console.log(
        'Error saving theme:',
        error
      );

    }

  };


  // ===================================================
  // TOGGLE LIGHT / DARK
  // ===================================================

  const toggleTheme = async () => {

    const newMode =
      theme === 'dark'
        ? 'light'
        : 'dark';

    await setTheme(newMode);

  };


  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      mode,
      theme,
      colors,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [
      mode,
      theme,
      colors,
      isDark,
    ]
  );


  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );

}


// =====================================================
// CUSTOM HOOK
// =====================================================

export function useTheme(): ThemeContextType {

  const context =
    useContext(ThemeContext);


  if (!context) {

    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );

  }


  return context;

}


// =====================================================
// OPTIONAL HELPER
// =====================================================

export function getThemeColors(
  scheme: ColorSchemeName
): ThemeColors {

  return scheme === 'dark'
    ? darkColors
    : lightColors;

}