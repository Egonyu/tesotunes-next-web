"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  Plus,
  User,
  Trash2,
  Archive,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  ImageIcon,
  Mic,
  X,
  FileAudio,
  Download,
  Eye,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { apiPostForm } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getEchoInstance } from "@/lib/echo";

interface Conversation {
  id: number;
  participant: {
    id: number;
    name: string;
    username: string;
    avatar_url: string | null;
    is_online: boolean;
    last_seen?: string;
  };
  last_message: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: number;
  } | null;
  unread_count: number;
  is_muted: boolean;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  delivered_at?: string;
  type: "text" | "image" | "audio" | "link";
  attachment_url?: string;
  attachment_name?: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ file: File; url: string; type: "image" | "audio" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiGet<Conversation[]>("/api/social/conversations"),
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: () =>
      selectedConversation
        ? apiGet<Message[]>(`/api/social/conversations/${selectedConversation}`)
        : Promise.resolve([]),
    enabled: !!selectedConversation,
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      apiPost(`/api/social/conversations/${selectedConversation}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageInput("");
    },
  });

  // Media message mutation
  const sendMediaMessage = useMutation({
    mutationFn: (data: { file: File; type: "image" | "audio"; caption?: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("type", data.type);
      if (data.caption) formData.append("content", data.caption);
      return apiPostForm(`/api/social/conversations/${selectedConversation}/messages/media`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMediaPreview(null);
      setMessageInput("");
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: (conversationId: number) =>
      apiPost(`/api/social/conversations/${conversationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
    },
  });

  // Auto-mark as read when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      const convo = conversations?.find((c) => c.id === selectedConversation);
      if (convo && convo.unread_count > 0) {
        markAsRead.mutate(selectedConversation);
      }
    }
  }, [selectedConversation, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file selection for media sharing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");

    if (!isImage && !isAudio) {
      return; // Only images and audio
    }

    const url = URL.createObjectURL(file);
    setMediaPreview({ file, url, type: isImage ? "image" : "audio" });
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const clearMediaPreview = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  };

  const handleSend = () => {
    if (!selectedConversation) return;
    
    if (mediaPreview) {
      sendMediaMessage.mutate({
        file: mediaPreview.file,
        type: mediaPreview.type,
        caption: messageInput.trim() || undefined,
      });
      return;
    }
    
    if (messageInput.trim()) {
      sendMessage.mutate(messageInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Real-time WebSocket for messages
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    const echo = getEchoInstance();
    if (!echo) return;

    // Listen on user's private channel for new messages across all conversations
    const channel = echo.private(`user.${session.user.id}`);
    
    const handleNewMessage = (event: { message: Message; conversation_id: number }) => {
      // Update messages list if currently viewing this conversation
      if (event.conversation_id === selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      }
      // Always refresh conversation list (updates last_message, unread_count)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleMessageRead = (event: { conversation_id: number }) => {
      if (event.conversation_id === selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    channel
      .listen('.message.created', handleNewMessage)
      .listen('.message.read', handleMessageRead)
      .listen('MessageSent', handleNewMessage)
      .listen('MessagesRead', handleMessageRead);

    // Track connection
    const pusher = (echo as unknown as { connector: { pusher: { connection: { bind: (event: string, cb: () => void) => void } } } }).connector?.pusher;
    if (pusher?.connection) {
      pusher.connection.bind('connected', () => setWsConnected(true));
      pusher.connection.bind('disconnected', () => setWsConnected(false));
      // Check if already connected
      if ((pusher.connection as unknown as { state: string }).state === 'connected') {
        setWsConnected(true);
      }
    }

    return () => {
      channel.stopListening('.message.created');
      channel.stopListening('.message.read');
      channel.stopListening('MessageSent');
      channel.stopListening('MessagesRead');
    };
  }, [session?.user?.id, selectedConversation, queryClient]);

  // Also subscribe to conversation-specific presence channel when viewing a chat
  useEffect(() => {
    if (!selectedConversation || !session?.user?.id) return;
    const echo = getEchoInstance();
    if (!echo) return;

    const channel = echo.private(`conversation.${selectedConversation}`);
    
    channel
      .listen('.message.created', (event: { message: Message }) => {
        queryClient.setQueryData<Message[]>(
          ["messages", selectedConversation],
          (old) => old ? [...old, event.message] : [event.message]
        );
      })
      .listen('.typing', () => {
        // Could show typing indicator here
      });

    return () => {
      channel.stopListening('.message.created');
      channel.stopListening('.typing');
      echo.leave(`conversation.${selectedConversation}`);
    };
  }, [selectedConversation, session?.user?.id, queryClient]);

  const selectedConvo = conversations?.find((c) => c.id === selectedConversation);
  const filteredConversations = conversations?.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingConversations) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${
          selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Messages</h1>
              <span
                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  wsConnected ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-muted text-muted-foreground'
                }`}
                title={wsConnected ? 'Real-time active' : 'Connecting...'}
              >
                {wsConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                {wsConnected ? 'Live' : '...'}
              </span>
            </div>
            <button className="p-2 hover:bg-muted rounded-full">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {!filteredConversations?.length ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No conversations yet</p>
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversation(convo.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors ${
                  selectedConversation === convo.id ? "bg-muted" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                    {convo.participant.avatar_url ? (
                      <Image
                        src={convo.participant.avatar_url}
                        alt={convo.participant.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 m-3 text-muted-foreground" />
                    )}
                  </div>
                  {convo.participant.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{convo.participant.name}</span>
                    {convo.last_message && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(convo.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {convo.last_message?.sender_id === Number(session?.user?.id) && (
                      <span className="flex-shrink-0">
                        {convo.last_message?.is_read ? (
                          <CheckCheck className="h-3 w-3 text-primary" />
                        ) : (
                          <Check className="h-3 w-3 text-muted-foreground" />
                        )}
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.last_message?.content || "Start chatting..."}
                    </p>
                  </div>
                </div>
                {convo.unread_count > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {convo.unread_count}
                  </span>
                )}
                {convo.is_muted && <BellOff className="h-4 w-4 text-muted-foreground" />}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          selectedConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-4">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-muted rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {selectedConvo.participant.avatar_url ? (
                    <Image
                      src={selectedConvo.participant.avatar_url}
                      alt={selectedConvo.participant.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 m-2.5 text-muted-foreground" />
                  )}
                </div>
                {selectedConvo.participant.is_online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{selectedConvo.participant.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedConvo.participant.is_online
                    ? "Online"
                    : `Last seen ${formatDate(selectedConvo.participant.last_seen || "")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-full">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                messages?.map((message) => {
                  const isOwn = message.sender_id === Number(session?.user?.id);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        {/* Media attachment */}
                        {message.type === "image" && message.attachment_url && (
                          <div className="mb-2 -mx-2 -mt-1">
                            <Image
                              src={message.attachment_url}
                              alt="Shared image"
                              width={300}
                              height={200}
                              className="rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(message.attachment_url, "_blank")}
                            />
                          </div>
                        )}
                        {message.type === "audio" && message.attachment_url && (
                          <div className="mb-2 flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                            <FileAudio className="h-8 w-8 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate">{message.attachment_name || "Audio message"}</p>
                              <audio controls className="w-full h-8 mt-1" preload="metadata">
                                <source src={message.attachment_url} />
                              </audio>
                            </div>
                          </div>
                        )}
                        {message.content && <p>{message.content}</p>}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isOwn && (
                            <span className="group relative">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : message.delivered_at ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              {/* Read receipt tooltip */}
                              <span className="absolute bottom-full right-0 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                {message.is_read && message.read_at
                                  ? `Read ${new Date(message.read_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}`
                                  : message.delivered_at
                                  ? `Delivered ${new Date(message.delivered_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}`
                                  : "Sending..."}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              {/* Media preview bar */}
              {mediaPreview && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {mediaPreview.type === "image" ? (
                    <Image src={mediaPreview.url} alt="Preview" width={60} height={60} className="rounded-lg object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                      <FileAudio className="h-8 w-8 text-primary" />
                      <span className="text-sm truncate max-w-[140px]">{mediaPreview.file.name}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mediaPreview.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(mediaPreview.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button onClick={clearMediaPreview} className="p-1 hover:bg-background rounded-full">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-muted rounded-full"
                  title="Send image or audio"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={mediaPreview ? "Add a caption..." : "Type a message..."}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-4 py-2 bg-muted rounded-full focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={(!messageInput.trim() && !mediaPreview) || sendMessage.isPending || sendMediaMessage.isPending}
                  className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
