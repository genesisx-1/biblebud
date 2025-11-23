import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '../components';
import { useAuth } from '../hooks/useAuth';
import { chatWithAI, createConversation, getMessages, getConversations } from '../services/supabase';
import { speak } from '../services/tts';
import theme from '../constants/theme';

const ChatScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const flatListRef = useRef(null);

  useEffect(() => {
    initializeConversation();
  }, [user]);

  const initializeConversation = async () => {
    if (!user) return;

    // Show welcome message immediately for instant UI
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! I'm Bible Bro, your faith companion. I'm here to help you explore scripture, answer questions, and provide biblical guidance for life's challenges. What's on your mind today?",
      created_at: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);

    // Load conversation and messages in background
    setLoadingMessages(true);
    try {
      // Try to get existing conversation first
      const { data: conversations, error: convError } = await getConversations(user.id);
      
      if (convError) {
        console.error('Error loading conversations:', convError);
        // Create new conversation on error
        const { data } = await createConversation(user.id, 'Chat with Bible Bro');
        if (data) {
          setConversationId(data.id);
        }
        setLoadingMessages(false);
        return;
      }

      let existingConversation = conversations?.[0]; // Get most recent conversation

      if (existingConversation) {
        setConversationId(existingConversation.id);
        // Load existing messages (limited to last 50 for performance)
        const { data: existingMessages, error: msgError } = await getMessages(existingConversation.id);
        
        if (msgError) {
          console.error('Error loading messages:', msgError);
        } else if (existingMessages && existingMessages.length > 0) {
          // Replace welcome message with actual messages
          setMessages(existingMessages);
        }
        // If no messages, keep welcome message
      } else {
        // Create new conversation
        const { data } = await createConversation(user.id, 'Chat with Bible Bro');
        if (data) {
          setConversationId(data.id);
        }
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom after message is added
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);

    // Call AI
    const { data, error } = await chatWithAI(userMessage.content, conversationId);

    if (error) {
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
      return;
    }

    const aiMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: data.response,
      scripture_references: data.references,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);

    // Scroll to bottom after AI response
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  const handleSpeak = async (message) => {
    if (speakingMessageId === message.id) {
      setSpeakingMessageId(null);
      await speak.stop();
    } else {
      setSpeakingMessageId(message.id);
      await speak.speak(message.content, {
        onDone: () => setSpeakingMessageId(null),
      });
    }
  };

  // Message component - must be a proper React component to use hooks
  const MessageItem = ({ item, onSpeak, isSpeaking }) => {
    const isUser = item.role === 'user';
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Only animate on mount, not on every render
      scaleAnim.setValue(1);
    }, []);

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Ionicons name="book" size={20} color={theme.colors.primary.pureWhite} />
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>

          {item.scripture_references && item.scripture_references.length > 0 && (
            <View style={styles.referencesContainer}>
              <Text style={styles.referencesLabel}>Scripture References:</Text>
              {item.scripture_references.map((ref, idx) => (
                <Text key={idx} style={styles.reference}>
                  • {ref}
                </Text>
              ))}
            </View>
          )}

          {!isUser && (
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => onSpeak(item)}
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle-outline' : 'volume-medium-outline'}
                size={18}
                color={theme.colors.primary.royalBlue}
              />
            </TouchableOpacity>
          )}
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={theme.colors.primary.pureWhite} />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderMessage = ({ item }) => {
    return (
      <MessageItem
        item={item}
        onSpeak={handleSpeak}
        isSpeaking={speakingMessageId === item.id}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={true}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about the Bible..."
          placeholderTextColor={theme.colors.text.light}
          multiline={false}
          maxLength={500}
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? theme.colors.primary.pureWhite : theme.colors.text.light}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  messagesList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: theme.colors.primary.royalBlue,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: theme.colors.background.card,
    borderBottomLeftRadius: 4,
    ...theme.shadows.small,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.relaxed,
  },
  userText: {
    color: theme.colors.primary.pureWhite,
  },
  assistantText: {
    color: theme.colors.text.primary,
  },
  referencesContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  referencesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.royalBlue,
    marginBottom: theme.spacing.xs,
  },
  reference: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  speakButton: {
    position: 'absolute',
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    marginLeft: 52,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.royalBlue,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.md + 20 : theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 0,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.royalBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.background.secondary,
  },
});

export default ChatScreen;
