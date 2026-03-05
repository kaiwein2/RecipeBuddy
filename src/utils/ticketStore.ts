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

// ─── Live Chats ────────────────────────────────────────────────────────────

export function getLiveChats(): LiveChatSession[] {
  try {
    const raw = localStorage.getItem(LIVE_CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createLiveChat(userName: string, email: string, firstMessage: string): LiveChatSession {
  const chats = getLiveChats();
  const now = new Date().toISOString();
  const session: LiveChatSession = {
    id: `CHAT-${Date.now().toString().slice(-6)}`,
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
  chats.unshift(session);
  localStorage.setItem(LIVE_CHATS_KEY, JSON.stringify(chats));
  return session;
}

export function addLiveChatMessage(
  sessionId: string,
  message: Omit<TicketMessage, 'id' | 'timestamp'>,
  incrementUnread = false,
): void {
  const chats = getLiveChats();
  const idx = chats.findIndex(c => c.id === sessionId);
  if (idx !== -1) {
    const msg: TicketMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    chats[idx].messages.push(msg);
    chats[idx].updatedAt = msg.timestamp;
    if (incrementUnread) chats[idx].unreadByAdmin += 1;
    localStorage.setItem(LIVE_CHATS_KEY, JSON.stringify(chats));
  }
}

export function markLiveChatRead(sessionId: string): void {
  const chats = getLiveChats();
  const idx = chats.findIndex(c => c.id === sessionId);
  if (idx !== -1) {
    chats[idx].unreadByAdmin = 0;
    localStorage.setItem(LIVE_CHATS_KEY, JSON.stringify(chats));
  }
}

export function closeLiveChat(sessionId: string): void {
  const chats = getLiveChats();
  const idx = chats.findIndex(c => c.id === sessionId);
  if (idx !== -1) {
    chats[idx].status = 'closed';
    chats[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(LIVE_CHATS_KEY, JSON.stringify(chats));
  }
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

  if (getLiveChats().length === 0) {
    const base = Date.now();
    const sessions: LiveChatSession[] = [
      {
        id: `CHAT-${(base).toString().slice(-6)}`,
        userName: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        status: 'active',
        createdAt: new Date(base - 1800000).toISOString(),
        updatedAt: new Date(base - 120000).toISOString(),
        unreadByAdmin: 2,
        messages: [
          { id: '1', text: 'Hi! I have a question about my account.', sender: 'user', timestamp: new Date(base - 1800000).toISOString() },
          { id: '2', text: 'Of course! Happy to help. What do you need?', sender: 'admin', timestamp: new Date(base - 1700000).toISOString() },
          { id: '3', text: 'I submitted a ticket but haven\'t heard back yet.', sender: 'user', timestamp: new Date(base - 300000).toISOString() },
          { id: '4', text: 'Can you check the status of TKT-001?', sender: 'user', timestamp: new Date(base - 120000).toISOString() },
        ],
      },
    ];
    localStorage.setItem(LIVE_CHATS_KEY, JSON.stringify(sessions));
  }
}
