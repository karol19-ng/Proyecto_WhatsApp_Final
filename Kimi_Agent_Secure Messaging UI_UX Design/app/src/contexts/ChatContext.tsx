import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_OTP_SERVICE_URL || 'https://cr4j9v-5000.csb.app';

export interface Contact {
  _id: string;
  phone: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  status?: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: { _id: string; phone: string; name: string; avatar?: string };
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  status: 'sent' | 'delivered' | 'read';
  deleted: boolean;
  edited: boolean;
  createdAt: string;
}

export interface Chat {
  _id: string;
  participants: Contact[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: any;
  updatedAt: string;
}

interface ChatContextType {
  contacts: Contact[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>;

  addContact: (phone: string) => Promise<void>;
  selectChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: string, mediaUrl?: string, extra?: any) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  deleteMessage: (messageId: string, chatId: string) => Promise<void>;
  editMessage: (messageId: string, content: string, chatId: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshChats: () => Promise<void>;
  createGroup: (name: string, phones: string[]) => Promise<void>;
  startChatWithContact: (contact: Contact) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user?.phone) {
      refreshContacts();
      refreshChats();
    }
  }, [user?.phone]);

  const refreshContacts = async () => {
    if (!user?.phone) return;
    try {
      const res = await fetch(`${API}/api/contacts/${encodeURIComponent(user.phone)}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch { setError('Error cargando contactos'); }
  };

  const refreshChats = async () => {
    if (!user?.phone) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chats/${encodeURIComponent(user.phone)}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch { setError('Error cargando chats'); }
    finally { setLoading(false); }
  };

  const addContact = async (phone: string) => {
    if (!user?.phone) throw new Error('No autenticado');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/contacts/${encodeURIComponent(user.phone)}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPhone: phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agregar el contacto');
      setContacts(prev => [...prev, data.contact]);
      await startChatWithContact(data.contact);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally { setLoading(false); }
  };

  const startChatWithContact = async (contact: Contact) => {
    if (!user?.phone) return;
    try {
      const res = await fetch(`${API}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myPhone: user.phone, participantPhone: contact.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setChats(prev => {
          const exists = prev.find(c => c._id === data.chat._id);
          return exists ? prev : [data.chat, ...prev];
        });
        setSelectedChat(data.chat);
        await loadMessages(data.chat._id);
      }
    } catch { setError('Error al abrir chat'); }
  };

  const selectChat = async (chat: Chat | null) => {
    setSelectedChat(chat);
    if (chat) await loadMessages(chat._id);
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`${API}/api/messages/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => ({ ...prev, [chatId]: data.messages || [] }));
      }
    } catch { console.error('Error cargando mensajes'); }
  };

  const sendMessage = async (content: string, type = 'text', mediaUrl?: string, extra?: any) => {
    if (!user?.phone || !selectedChat) return;
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat._id,
          senderPhone: user.phone,
          content, type, mediaUrl,
          fileName: extra?.fileName,
          fileSize: extra?.fileSize,
          duration: extra?.duration,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => ({
          ...prev,
          [selectedChat._id]: [...(prev[selectedChat._id] || []), data.message],
        }));
        setChats(prev => prev.map(c =>
          c._id === selectedChat._id
            ? { ...c, lastMessage: data.message, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      }
    } catch { setError('Error al enviar mensaje'); }
  };

  const deleteMessage = async (messageId: string, chatId: string) => {
    try {
      await fetch(`${API}/api/messages/${messageId}`, { method: 'DELETE' });
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(m =>
          m._id === messageId ? { ...m, deleted: true, content: 'Mensaje eliminado' } : m
        ) || [],
      }));
    } catch { setError('Error al eliminar mensaje'); }
  };

  const editMessage = async (messageId: string, content: string, chatId: string) => {
    try {
      const res = await fetch(`${API}/api/messages/${messageId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => ({
          ...prev,
          [chatId]: prev[chatId]?.map(m => m._id === messageId ? data.message : m) || [],
        }));
      }
    } catch { setError('Error al editar mensaje'); }
  };

  const createGroup = async (name: string, phones: string[]) => {
    if (!user?.phone) return;
    try {
      const res = await fetch(`${API}/api/chats/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myPhone: user.phone, participantPhones: phones, groupName: name }),
      });
      const data = await res.json();
      if (res.ok) {
        setChats(prev => [data.chat, ...prev]);
        setSelectedChat(data.chat);
      }
    } catch { setError('Error al crear grupo'); }
  };

  return (
    <ChatContext.Provider value={{
      contacts, chats, messages, selectedChat, loading, error, typingUsers,
      addContact, selectChat, sendMessage, loadMessages,
      deleteMessage, editMessage, refreshContacts, refreshChats,
      createGroup, startChatWithContact,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};