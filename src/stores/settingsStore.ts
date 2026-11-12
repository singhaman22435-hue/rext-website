import { useSyncExternalStore } from 'react';
import { ThemeMode, FontStyle } from '../types';

export interface SettingsState {
  theme: ThemeMode;
  font: FontStyle;
  isPro: boolean;
  sleepTimerEnd: number | null;
}

const STORAGE_THEME_KEY = 'rext_theme';
const STORAGE_FONT_KEY = 'rext_font';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'warmer';
  return (localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode) || 'warmer';
}

function getStoredFont(): FontStyle {
  if (typeof window === 'undefined') return 'outfit';
  return (localStorage.getItem(STORAGE_FONT_KEY) as FontStyle) || 'outfit';
}

const initialState: SettingsState = {
  theme: getStoredTheme(),
  font: getStoredFont(),
  isPro: false,
  sleepTimerEnd: null,
};

type Listener = () => void;

class SettingsStore {
  private state: SettingsState = { ...initialState };
  private listeners: Set<Listener> = new Set();

  public getState(): SettingsState {
    return this.state;
  }

  public setState(partial: Partial<SettingsState> | ((prev: SettingsState) => Partial<SettingsState>)): void {
    const next = typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...next };
    this.notify();
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public setTheme(theme: ThemeMode): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
      document.body.classList.remove('theme-warmer', 'theme-sunset', 'theme-cold', 'theme-mocha');
      document.body.classList.add(`theme-${theme}`);
    }
    this.setState({ theme });
  }

  public setFont(font: FontStyle): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_FONT_KEY, font);
      document.body.classList.remove('font-outfit', 'font-syne', 'font-space', 'font-cinzel', 'font-jakarta');
      document.body.classList.add(`font-${font}`);
    }
    this.setState({ font });
  }

  public setPro(isPro: boolean): void {
    this.setState({ isPro });
  }

  public setSleepTimer(endTimestamp: number | null): void {
    this.setState({ sleepTimerEnd: endTimestamp });
  }
}

export const settingsStore = new SettingsStore();

export function useSettingsStore<T>(selector: (state: SettingsState) => T): T {
  return useSyncExternalStore(
    settingsStore.subscribe,
    () => selector(settingsStore.getState()),
    () => selector(initialState)
  );
}

export const useTheme = () => useSettingsStore((s) => s.theme);
export const useFont = () => useSettingsStore((s) => s.font);
export const useIsPro = () => useSettingsStore((s) => s.isPro);
export const useSleepTimerEnd = () => useSettingsStore((s) => s.sleepTimerEnd);

