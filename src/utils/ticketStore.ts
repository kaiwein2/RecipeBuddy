import { db } from '../lib/firebase';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, arrayUnion, increment } from 'firebase/firestore';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketType = 'bug' | 'feature' | 'account' | 'performance' | 'data' | 'other';

export interface TicketMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string; // ISO string
}

export interface Ticket {
  id: string;
  type: TicketType;
  description: string;
  email: string;
  status: TicketStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  messages: TicketMessage[];
  userName?: string;
}

export interface LiveChatSession {
  id: string;
  userName: string;
  email: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  unreadByAdmin: number;
}

const TICKETS_KEY = 'recipebuddy_tickets';
const LIVE_CHATS_KEY = 'recipebuddy_live_chats';

// ─── Tickets ────────────────────────────────────────────────────────────────

export function getTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTicket(ticket: Omit<Ticket, 'messages' | 'status' | 'createdAt' | 'updatedAt'>): Ticket {
  const tickets = getTickets();
  const now = new Date().toISOString();
  const newTicket: Ticket = {
    ...ticket,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  tickets.unshift(newTicket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  return newTicket;
}

export function updateTicket(id: string, updates: Partial<Ticket>): void {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }
}

export function addTicketMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>): void {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx !== -1) {
    const msg: TicketMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    tickets[idx].messages.push(msg);
    tickets[idx].updatedAt = msg.timestamp;
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }
}

// ─── Live Chats (Firebase Firestore) ───────────────────────────────────────

export async function createLiveChat(userName: string, email: string, firstMessage: string): Promise<LiveChatSession> {
  const now = new Date().toISOString();
  const sessionData = {
    userName,
    email,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    unreadByAdmin: 1,
    messages: [
      {
        id: Date.now().toString(),
        text: firstMessage,
        sender: 'user',
        timestamp: now,
      },
    ],
  };
  const docRef = await addDoc(collection(db, 'live_chats'), sessionData);
  return { id: docRef.id, ...sessionData } as LiveChatSession;
}

export async function addLiveChatMessage(
  sessionId: string,
  message: Omit<TicketMessage, 'id' | 'timestamp'>,
  incrementUnread = false,
): Promise<void> {
  const now = new Date().toISOString();
  const msg: TicketMessage = {
    ...message,
    id: Date.now().toString(),
    timestamp: now,
  };

  const chatRef = doc(db, 'live_chats', sessionId);
  const updates: any = {
    messages: arrayUnion(msg),
    updatedAt: now
  };
  
  if (incrementUnread) {
    updates.unreadByAdmin = increment(1);
  }
  
  try {
    await updateDoc(chatRef, updates);
  } catch (err) {
    console.error("Failed to add message", err);
  }
}

export async function markLiveChatRead(sessionId: string): Promise<void> {
  const chatRef = doc(db, 'live_chats', sessionId);
  try {
    await updateDoc(chatRef, { unreadByAdmin: 0 });
  } catch (err) {
    console.error("Failed to mark read", err);
  }
}

export async function closeLiveChat(sessionId: string): Promise<void> {
  const chatRef = doc(db, 'live_chats', sessionId);
  try {
    await updateDoc(chatRef, { 
      status: 'closed',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to close ticket", err);
  }
}

// ─── Real-Time Listeners ───────────────────────────────────────────────────

export function subscribeToLiveChats(callback: (chats: LiveChatSession[]) => void) {
  const q = query(collection(db, 'live_chats'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveChatSession));
    callback(chats);
  }, (error) => {
    console.error("Error fetching live chats in real-time", error);
    callback([]);
  });
}

export function subscribeToSingleChat(sessionId: string, callback: (chat: LiveChatSession | null) => void) {
  if (!sessionId) {
    callback(null);
    return () => {};
  }
  const chatRef = doc(db, 'live_chats', sessionId);
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as LiveChatSession);
    } else {
      callback(null);
    }
  });
}

// ─── Seed demo data if empty ────────────────────────────────────────────────

export function seedDemoData(): void {
  if (getTickets().length === 0) {
    const base = Date.now();
    const tickets: Ticket[] = [
      {
        id: `TKT-${(base).toString().slice(-6)}`,
        type: 'bug',
        description: 'App crashes when I try to open a recipe on mobile Safari.',
        email: 'john@example.com',
        userName: 'John Doe',
        status: 'open',
        createdAt: new Date(base - 3600000 * 3).toISOString(),
        updatedAt: new Date(base - 3600000 * 3).toISOString(),
        messages: [],
      },
      {
        id: `TKT-${(base + 1).toString().slice(-6)}`,
        type: 'feature',
        description: 'Would love a meal planning calendar feature where I can drag recipes onto days of the week.',
        email: 'sarah.j@example.com',
        userName: 'Sarah Johnson',
        status: 'in-progress',
        createdAt: new Date(base - 3600000 * 24).toISOString(),
        updatedAt: new Date(base - 3600000 * 12).toISOString(),
        messages: [
          {
            id: '1',
            text: 'Thanks for your suggestion! We are actively exploring this feature.',
            sender: 'admin',
            timestamp: new Date(base - 3600000 * 12).toISOString(),
          },
        ],
      },
      {
        id: `TKT-${(base + 2).toString().slice(-6)}`,
        type: 'account',
        description: 'I cannot log in — it says my email does not exist but I registered last week.',
        email: 'newuser@example.com',
        userName: 'Alex Kim',
        status: 'resolved',
        createdAt: new Date(base - 3600000 * 48).toISOString(),
        updatedAt: new Date(base - 3600000 * 24).toISOString(),
        messages: [
          {
            id: '1',
            text: 'We identified a sync issue with email verification. Your account has been manually verified — please try logging in now.',
            sender: 'admin',
            timestamp: new Date(base - 3600000 * 24).toISOString(),
          },
        ],
      },
    ];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }

  if (getTickets().length === 0) {
    // keeping seed for LocalStorage tickets...
  }
}
