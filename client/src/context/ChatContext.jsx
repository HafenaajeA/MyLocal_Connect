import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

// Chat Context
const ChatContext = createContext();

// Action types
const CHAT_ACTIONS = {
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_CHATS: 'SET_CHATS',
  ADD_CHAT: 'ADD_CHAT',
  UPDATE_CHAT: 'UPDATE_CHAT',
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  socket: null,
  isConnected: false,
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  loading: false,
  error: null
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
    
    case CHAT_ACTIONS.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case CHAT_ACTIONS.SET_CHATS:
      return { ...state, chats: action.payload };
    
    case CHAT_ACTIONS.ADD_CHAT:
      return { 
        ...state, 
        chats: [action.payload, ...state.chats.filter(c => c._id !== action.payload._id)]
      };
    
    case CHAT_ACTIONS.UPDATE_CHAT:
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat._id === action.payload.chatId
            ? { ...chat, ...action.payload.updates }
            : chat
        )
      };
    
    case CHAT_ACTIONS.SET_ACTIVE_CHAT:
      return { ...state, activeChat: action.payload };
    
    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages
        }
      };
    
    case CHAT_ACTIONS.ADD_MESSAGE:
      const chatId = action.payload.chatId;
      const currentMessages = state.messages[chatId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...currentMessages, action.payload.message]
        }
      };
    
    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: state.messages[action.payload.chatId]?.map(msg =>
            msg._id === action.payload.message._id ? action.payload.message : msg
          ) || []
        }
      };
    
    case CHAT_ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: state.messages[action.payload.chatId]?.map(msg =>
            msg._id === action.payload.messageId 
              ? { ...msg, isDeleted: true, content: 'This message has been deleted' }
              : msg
          ) || []
        }
      };
    
    case CHAT_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.chatId]: action.payload.users
        }
      };
    
    case CHAT_ACTIONS.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.payload };
    
    case CHAT_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CHAT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case CHAT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Chat Provider
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize socket connection with token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = connectSocket(token);
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, []); // Empty dependency array is fine here

  // Initialize Socket.IO connection
  const connectSocket = (token) => {
    if (state.socket) {
      state.socket.disconnect();
    }

    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    dispatch({ type: CHAT_ACTIONS.SET_SOCKET, payload: newSocket });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: false });
    });

    // Chat events
    newSocket.on('new_message', (data) => {
      dispatch({
        type: CHAT_ACTIONS.ADD_MESSAGE,
        payload: {
          chatId: data.chatId,
          message: data.message
        }
      });

      // Update chat's last message
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CHAT,
        payload: {
          chatId: data.chatId,
          updates: {
            lastMessage: data.message,
            lastActivity: new Date()
          }
        }
      });
    });

    newSocket.on('message_edited', (data) => {
      dispatch({
        type: CHAT_ACTIONS.UPDATE_MESSAGE,
        payload: {
          chatId: data.chatId,
          message: data.message
        }
      });
    });

    newSocket.on('message_deleted', (data) => {
      dispatch({
        type: CHAT_ACTIONS.DELETE_MESSAGE,
        payload: {
          chatId: data.chatId,
          messageId: data.messageId
        }
      });
    });

    newSocket.on('user_typing', (data) => {
      const currentTyping = state.typingUsers[data.chatId] || [];
      if (!currentTyping.find(user => user.id === data.user.id)) {
        dispatch({
          type: CHAT_ACTIONS.SET_TYPING_USERS,
          payload: {
            chatId: data.chatId,
            users: [...currentTyping, data.user]
          }
        });
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      const currentTyping = state.typingUsers[data.chatId] || [];
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          chatId: data.chatId,
          users: currentTyping.filter(user => user.id !== data.user.id)
        }
      });
    });

    newSocket.on('chat_updated', (data) => {
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CHAT,
        payload: {
          chatId: data.chatId,
          updates: {
            lastMessage: data.lastMessage,
            lastActivity: data.lastActivity
          }
        }
      });
    });

    newSocket.on('user_status_changed', (data) => {
      // Handle online/offline status updates
      console.log('User status changed:', data);
    });

    newSocket.on('chat_error', (error) => {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    });

    newSocket.on('message_error', (error) => {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    });

    return newSocket;
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: CHAT_ACTIONS.SET_SOCKET, payload: null });
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: false });
    }
  };

  // Chat actions
  const joinChat = useCallback((chatId) => {
    if (state.socket) {
      state.socket.emit('join_chat', { chatId });
    }
  }, [state.socket]);

  const leaveChat = useCallback((chatId) => {
    if (state.socket) {
      state.socket.emit('leave_chat', { chatId });
    }
  }, [state.socket]);

  const sendMessage = useCallback((chatId, content, messageType = 'text', replyTo = null) => {
    if (state.socket && content.trim()) {
      state.socket.emit('send_message', {
        chatId,
        content: content.trim(),
        messageType,
        replyTo
      });
    }
  }, [state.socket]);

  const editMessage = (messageId, newContent) => {
    if (state.socket) {
      state.socket.emit('edit_message', {
        messageId,
        newContent
      });
    }
  };

  const deleteMessage = (messageId) => {
    if (state.socket) {
      state.socket.emit('delete_message', { messageId });
    }
  };

  const addReaction = (messageId, emoji) => {
    if (state.socket) {
      state.socket.emit('add_reaction', { messageId, emoji });
    }
  };

  const startTyping = (chatId) => {
    if (state.socket) {
      state.socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (state.socket) {
      state.socket.emit('typing_stop', { chatId });
    }
  };

  const markMessagesAsRead = useCallback((chatId) => {
    if (state.socket) {
      state.socket.emit('mark_messages_read', { chatId });
    }
  }, [state.socket]);

  // HTTP API calls
  const fetchChats = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: data.chats });
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: CHAT_ACTIONS.SET_MESSAGES,
          payload: {
            chatId,
            messages: data.messages
          }
        });
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [dispatch]);

  const startChat = useCallback(async (vendorId, businessId) => {
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${serverUrl}/api/chats/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vendorId, businessId })
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: CHAT_ACTIONS.ADD_CHAT, payload: data.chat });
        return data.chat;
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  const setActiveChat = useCallback((chat) => {
    dispatch({ type: CHAT_ACTIONS.SET_ACTIVE_CHAT, payload: chat });
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.socket) {
        state.socket.disconnect();
      }
    };
  }, []);

  const value = {
    ...state,
    connectSocket,
    disconnectSocket,
    joinChat,
    leaveChat,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    fetchChats,
    fetchMessages,
    startChat,
    clearError,
    setActiveChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
