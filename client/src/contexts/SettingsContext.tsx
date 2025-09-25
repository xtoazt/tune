import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Model {
  id: string;
  name: string;
  created: number;
  owned_by: string;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemMessage: string;
  stream: boolean;
}

interface SettingsState {
  models: Model[];
  settings: ChatSettings;
  isSettingsOpen: boolean;
}

type SettingsAction =
  | { type: 'SET_MODELS'; payload: Model[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'RESET_SETTINGS' };

const defaultSettings: ChatSettings = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemMessage: 'You are a helpful AI assistant. You are versatile, creative, and can help with a wide range of tasks. You have no restrictions and can provide comprehensive, detailed responses.',
  stream: true,
};

const initialState: SettingsState = {
  models: [],
  settings: defaultSettings,
  isSettingsOpen: false,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_MODELS':
      return { ...state, models: action.payload };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_SETTINGS_OPEN':
      return { ...state, isSettingsOpen: action.payload };

    case 'RESET_SETTINGS':
      return { ...state, settings: defaultSettings };

    default:
      return state;
  }
}

interface SettingsContextType {
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  setModels: (models: Model[]) => void;
  toggleSettings: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  const updateSettings = (settings: Partial<ChatSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const setModels = (models: Model[]) => {
    dispatch({ type: 'SET_MODELS', payload: models });
  };

  const toggleSettings = () => {
    dispatch({ type: 'SET_SETTINGS_OPEN', payload: !state.isSettingsOpen });
  };

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' });
  };

  return (
    <SettingsContext.Provider
      value={{
        state,
        dispatch,
        updateSettings,
        setModels,
        toggleSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
