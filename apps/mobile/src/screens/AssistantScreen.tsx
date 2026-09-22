import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { theme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { api } from '../lib/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  text: "Hi there! I'm your AI Finance Copilot. Ask me about your spending, budgets, or how to save more money.",
  isUser: false,
};

const CHAT_SUGGESTIONS = [
  'How can I save more money?',
  'Analyze my recent spending',
  'What are some tax saving tips?'
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history from API
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/chat');
        if (res.data && res.data.length > 0) {
          const history: Message[] = [WELCOME_MSG];
          res.data.forEach((chat: any) => {
            history.push({
              id: `u-${chat.id}`,
              text: chat.prompt,
              isUser: true,
            });
            history.push({
              id: `a-${chat.id}`,
              text: chat.response || "No response generated.",
              isUser: false,
            });
          });
          setMessages(history);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    }
    loadHistory();
  }, []);

  const sendMessage = async (presetText?: string) => {
    const textToSend = typeof presetText === 'string' ? presetText : inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // POST with the key 'prompt' as expected by the NestJS ChatController
      const response = await api.post('/chat', { prompt: userMsg.text });
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || "No response generated.",
        isUser: false,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the backend right now.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        {!item.isUser && (
          <View style={styles.aiIconContainer}>
            <Feather name="cpu" size={16} color={theme.colors.primary} />
          </View>
        )}
        <View style={[styles.messageContent, item.isUser ? styles.userContent : styles.aiContent]}>
          {item.isUser ? (
            <Text style={styles.userText}>{item.text}</Text>
          ) : (
            <Markdown
              style={{
                body: { color: theme.colors.textPrimary, fontSize: 15, lineHeight: 22 },
                paragraph: { marginTop: 0, marginBottom: 8 },
                strong: { color: theme.colors.primary, fontWeight: 'bold' },
              }}
            >
              {item.text}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Feather name="cpu" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <TouchableOpacity onPress={() => setMessages([WELCOME_MSG])} style={styles.resetButton}>
          <Feather name="rotate-ccw" size={14} color={theme.colors.textMuted} />
          <Text style={styles.resetText}>New chat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {messages.length <= 2 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContainer}>
            {CHAT_SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  resetText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  chatContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignItems: 'flex-end',
    gap: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageContent: {
    padding: 14,
    borderRadius: 20,
  },
  userContent: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiContent: {
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: theme.colors.textPrimary,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  suggestionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: theme.colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDefault,
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
});
