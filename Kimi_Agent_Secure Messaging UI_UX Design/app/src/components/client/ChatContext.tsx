// contexts/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  statusMessage?: string;
  addedAt: Date;
}

export interface Chat {
  id: string;
  type: "individual";
  contactId: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  encrypted: boolean;
}

interface ChatContextType {
  contacts: Contact[];
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId -> messages
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;

  // Acciones
  addContact: (phone: string) => Promise<void>;
  selectChat: (chatId: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar contactos al autenticar
  useEffect(() => {
    if (user && token) {
      refreshContacts();
    }
  }, [user, token]);

  const refreshContacts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        setChats(data.chats); // Backend devuelve chats asociados
      }
    } catch (err) {
      setError("Error cargando contactos");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (phone: string) => {
    if (!token) throw new Error("No autenticado");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "No se pudo agregar el contacto");
      }

      const { contact, chat } = await res.json();

      // Agregar a estado local
      setContacts((prev) => [...prev, contact]);
      setChats((prev) => [...prev, chat]);

      // Seleccionar el nuevo chat automáticamente
      setSelectedChat(chat);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectChat = (chatId: string | null) => {
    if (!chatId) {
      setSelectedChat(null);
      return;
    }
    const chat = chats.find((c) => c.id === chatId) || null;
    setSelectedChat(chat);
    if (chat) {
      loadMessages(chatId);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!token || messages[chatId]) return; // Ya cargados

    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages((prev) => ({ ...prev, [chatId]: msgs }));
      }
    } catch {
      console.error("Error cargando mensajes");
    }
  };

  const sendMessage = async (content: string) => {
    if (!token || !selectedChat || !user) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      chatId: selectedChat.id,
      senderId: user.id,
      content,
      timestamp: new Date(),
      status: "sent",
      encrypted: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    try {
      const res = await fetch(
        `${API_URL}/api/chats/${selectedChat.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (res.ok) {
        const savedMessage = await res.json();
        // Reemplazar mensaje temporal
        setMessages((prev) => ({
          ...prev,
          [selectedChat.id]: prev[selectedChat.id].map((m) =>
            m.id === tempId ? savedMessage : m
          ),
        }));

        // Actualizar lastMessage en el chat
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id
              ? { ...c, lastMessage: savedMessage, updatedAt: new Date() }
              : c
          )
        );
      }
    } catch {
      // Marcar como error
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id].map((m) =>
          m.id === tempId ? { ...m, status: "error" as any } : m
        ),
      }));
    }
  };

  return (
    <ChatContext.Provider
      value={{
        contacts,
        chats,
        messages,
        selectedChat,
        loading,
        error,
        addContact,
        selectChat,
        sendMessage,
        loadMessages,
        refreshContacts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
