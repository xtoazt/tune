import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  systemMessage?: string;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
}

type ChatAction =
  | { type: 'CREATE_SESSION'; payload: { title: string; model: string; systemMessage?: string } }
  | { type: 'SET_CURRENT_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { sessionId: string; messageId: string; content: string } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'CLEAR_SESSION'; payload: string };

const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  isStreaming: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CREATE_SESSION': {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: action.payload.title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: action.payload.model,
        systemMessage: action.payload.systemMessage,
      };
      return {
        ...state,
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
      };
    }

    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSessionId: action.payload,
      };

    case 'ADD_MESSAGE': {
      const { sessionId, message } = action.payload;
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, message],
                updatedAt: new Date(),
              }
            : session
        ),
      };
    }

    case 'UPDATE_MESSAGE': {
      const { sessionId, messageId, content } = action.payload;
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
                updatedAt: new Date(),
              }
            : session
        ),
      };
    }

    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        currentSessionId: state.currentSessionId === action.payload ? null : state.currentSessionId,
      };

    case 'CLEAR_SESSION': {
      const { payload: sessionId } = action;
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? { ...session, messages: [], updatedAt: new Date() }
            : session
        ),
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  currentSession: ChatSession | null;
  createSession: (title: string, model: string, systemMessage?: string) => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const currentSession = state.sessions.find(session => session.id === state.currentSessionId) || null;

  const createSession = (title: string, model: string, systemMessage?: string) => {
    dispatch({ type: 'CREATE_SESSION', payload: { title, model, systemMessage } });
  };

  const setCurrentSession = (sessionId: string) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
  };

  const addMessage = (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: newMessage } });
  };

  const updateMessage = (sessionId: string, messageId: string, content: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { sessionId, messageId, content } });
  };

  const deleteSession = (sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId });
  };

  const clearSession = (sessionId: string) => {
    dispatch({ type: 'CLEAR_SESSION', payload: sessionId });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setStreaming = (streaming: boolean) => {
    dispatch({ type: 'SET_STREAMING', payload: streaming });
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        currentSession,
        createSession,
        setCurrentSession,
        addMessage,
        updateMessage,
        deleteSession,
        clearSession,
        setLoading,
        setStreaming,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
