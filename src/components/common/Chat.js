import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getUnreadCount(chatMessages, userId) {
  if (!chatMessages) return 0;
  return chatMessages.filter((m) => !m.read && m.from !== userId).length;
}

function getLastMessage(chatMessages) {
  if (!chatMessages || chatMessages.length === 0) return null;
  return chatMessages[chatMessages.length - 1];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ChatListItem({ name, lastMessage, unread, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
        active ? 'bg-nobilis-green/10' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 shrink-0 rounded-full bg-nobilis-green flex items-center justify-center text-white font-semibold text-sm">
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-gray-900 truncate">{name}</span>
          {lastMessage && (
            <span className="text-[11px] text-gray-400 shrink-0 ml-2">
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {lastMessage.fileUrl ? '📎 File' : lastMessage.text}
          </p>
        )}
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-nobilis-green text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message, isOwn }) {
  const isFile = !!message.fileUrl;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-nobilis-green text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {!isOwn && (
          <p className="text-[11px] font-semibold mb-0.5 text-nobilis-green-light">
            {message.fromName}
          </p>
        )}

        {isFile ? (
          <div className="flex items-center gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span className="truncate">{message.text || 'Attachment'}</span>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        )}

        <p
          className={`text-[10px] mt-1 text-right ${
            isOwn ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          {formatTime(message.timestamp)}
          {isOwn && (
            <span className="ml-1">{message.read ? '✓✓' : '✓'}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function ChatInput({ onSend }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    // Reset height after clearing
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    });
  }, [text, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-end gap-2 p-3 border-t bg-white">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        rows={1}
        className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        className="shrink-0 w-10 h-10 rounded-full bg-nobilis-green text-white flex items-center justify-center transition-opacity disabled:opacity-40"
        aria-label="Send message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-500 mb-1">No messages yet</h3>
      <p className="text-sm text-gray-400 max-w-sm">
        Start the conversation by sending a message below.
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Chat({ user, students, messages, onSendMessage, onMarkRead }) {
  const [activeChatId, setActiveChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // For a student, the chat partner is their curator (derived from messages keys).
  // For a curator, each student is a chat partner.
  const isCurator = user.role === 'curator';

  // Build conversation list
  const conversations = React.useMemo(() => {
    if (isCurator && students) {
      return students.map((s) => ({
        chatId: s.id,
        name: s.name || s.fullName || `Student ${s.id}`,
        lastMessage: getLastMessage(messages[s.id]),
        unread: getUnreadCount(messages[s.id], user.id),
      }));
    }

    // Student view: show all conversation partners
    return Object.keys(messages || {}).map((chatId) => {
      const chatMsgs = messages[chatId];
      const partner = chatMsgs?.find((m) => m.from !== user.id);
      return {
        chatId,
        name: partner?.fromName || 'Curator',
        lastMessage: getLastMessage(chatMsgs),
        unread: getUnreadCount(chatMsgs, user.id),
      };
    });
  }, [isCurator, students, messages, user.id]);

  // For student with a single conversation, auto-select it
  useEffect(() => {
    if (!isCurator && conversations.length === 1 && !activeChatId) {
      setActiveChatId(conversations[0].chatId);
    }
  }, [isCurator, conversations, activeChatId]);

  // Auto-scroll to bottom when messages change
  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, activeChatId]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (activeChatId && onMarkRead) {
      const unread = getUnreadCount(messages[activeChatId], user.id);
      if (unread > 0) {
        onMarkRead(activeChatId);
      }
    }
  }, [activeChatId, messages, user.id, onMarkRead]);

  const handleSend = useCallback(
    (text) => {
      if (activeChatId && onSendMessage) {
        onSendMessage(activeChatId, text);
      }
    },
    [activeChatId, onSendMessage],
  );

  const handleSelectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  const handleBack = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const activeConversation = conversations.find((c) => c.chatId === activeChatId);

  // ── Chat Detail View ────────────────────────────────────────────────────

  if (activeChatId) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b">
          {(isCurator || conversations.length > 1) && (
            <button
              type="button"
              onClick={handleBack}
              className="shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Back to chats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-nobilis-green flex items-center justify-center text-white font-semibold text-xs">
            {activeConversation?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="font-medium text-sm text-gray-900 truncate">
            {activeConversation?.name || 'Chat'}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {activeMessages.length === 0 ? (
            <EmptyMessages />
          ) : (
            activeMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.from === user.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </div>
    );
  }

  // ── Chat List View ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">No conversations</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              {isCurator
                ? 'Your student conversations will appear here.'
                : 'Your chat with your curator will appear here.'}
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ChatListItem
              key={conv.chatId}
              name={conv.name}
              lastMessage={conv.lastMessage}
              unread={conv.unread}
              active={conv.chatId === activeChatId}
              onClick={() => handleSelectChat(conv.chatId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
