import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'aether-app-settings';

// All values here are UI-only preferences with no backend behind them yet.
export const DEFAULT_SETTINGS = {
  general: {
    accentColor: 'blue', // blue | purple | cyan | green | rose
    language: 'en',
    fontSize: 'md', // sm | md | lg
    editorFont: 'jetbrains-mono',
  },
  ai: {
    model: 'aether-1-coder',
    temperature: 0.7,
    maxTokens: 2048,
    contextLength: 16000,
    streaming: true,
    memory: true,
    autoSave: true,
    autoSuggest: true,
    thinkingMode: false,
  },
  workspace: {
    defaultWorkspace: 'Personal',
    autoBackup: true,
    autoRestore: true,
    gitIntegration: false,
    terminalShellDefault: 'zsh',
  },
  editor: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    lineNumbers: true,
    minimap: false,
    autoComplete: true,
    formatOnSave: true,
  },
  terminal: {
    defaultShell: 'zsh',
    fontSize: 13,
    cursorStyle: 'bar', // bar | block | underline
  },
  notifications: {
    desktop: true,
    sound: false,
    email: true,
  },
  security: {
    twoFactorEnabled: false,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable — settings still work for the session.
    }
    document.documentElement.setAttribute('data-accent', settings.general.accentColor);
    document.documentElement.setAttribute('data-font-size', settings.general.fontSize);
  }, [settings]);

  const updateSection = useCallback((section, patch) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...(typeof patch === 'function' ? patch(prev[section]) : patch),
      },
    }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return (
    <SettingsContext.Provider value={{ settings, updateSection, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
