import { create } from 'zustand';

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: Date;
  mediaType?: string;
  mediaUrl?: string;
  isSender: boolean;
}

export interface MonthGroup {
  key: string; // "March_2026"
  label: string; // "March 2026"
  messages: ChatMessage[];
  lastMessage: ChatMessage;
}

interface ChatState {
  rawData: Record<string, unknown> | null;
  availableUsers: string[];
  selectedUser: string | null;
  monthGroups: MonthGroup[];
  activeMonth: string | null;
  searchQuery: string;
  isProcessing: boolean;
  fileName: string | null;

  setRawData: (data: Record<string, unknown>, fileName: string) => void;
  selectUser: (username: string) => void;
  setActiveMonth: (monthKey: string) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseSnapchatData(data: unknown, username: string): MonthGroup[] {
  const messages: ChatMessage[] = [];

  // Try multiple common Snapchat export structures
  const tryExtract = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && typeof item === 'object') {
          const msg = item as Record<string, unknown>;
          // Check if this message involves the selected user
          const sender = (msg['From'] || msg['from'] || msg['Sender'] || msg['sender'] || msg['sender_name'] || '') as string;
          const recipient = (msg['To'] || msg['to'] || msg['Recipient'] || msg['recipient'] || '') as string;
          const content = (msg['Content'] || msg['content'] || msg['Text'] || msg['text'] || msg['message'] || msg['body'] || '') as string;
          const timestamp = msg['Created'] || msg['created'] || msg['timestamp'] || msg['date'] || msg['created_at'] || msg['Created Date'] || '';
          const mediaType = (msg['Media Type'] || msg['media_type'] || msg['type'] || '') as string;
          const isSenderRaw = msg['IsSender'] ?? msg['is_sender'] ?? msg['isSender'];
          const isSenderBool = typeof isSenderRaw === 'boolean' ? isSenderRaw : undefined;

          // If IsSender field exists, this message is part of the selected conversation — don't filter it
          const hasIsSender = isSenderBool !== undefined;
          const involvedWithUser = hasIsSender ||
            sender.toLowerCase().includes(username.toLowerCase()) ||
            recipient.toLowerCase().includes(username.toLowerCase());

          if (involvedWithUser && (content || mediaType)) {
            messages.push({
              sender: sender as string,
              content: content as string,
              timestamp: new Date(timestamp as string),
              mediaType: mediaType as string,
              isSender: isSenderBool ?? sender.toLowerCase() === username.toLowerCase(),
            });
          }
        }
      }
      return;
    }

    // Recurse into object values
    for (const value of Object.values(obj as Record<string, unknown>)) {
      tryExtract(value);
    }
  };

  tryExtract(data);

  // Sort chronologically
  messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Group by month+year
  const groups = new Map<string, ChatMessage[]>();
  for (const msg of messages) {
    if (isNaN(msg.timestamp.getTime())) continue;
    const month = MONTH_NAMES[msg.timestamp.getMonth()];
    const year = msg.timestamp.getFullYear();
    const key = `${month}_${year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }

  const monthGroups: MonthGroup[] = [];
  for (const [key, msgs] of groups) {
    const [month, year] = key.split('_');
    monthGroups.push({
      key,
      label: `${month} ${year}`,
      messages: msgs,
      lastMessage: msgs[msgs.length - 1],
    });
  }

  // Sort groups by date (newest first for sidebar)
  monthGroups.sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime());

  return monthGroups;
}

function extractUsernames(data: unknown): string[] {
  const usernames = new Set<string>();

  const extract = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && typeof item === 'object') {
          const msg = item as Record<string, unknown>;
          const sender = (msg['From'] || msg['from'] || msg['Sender'] || msg['sender'] || msg['sender_name'] || '') as string;
          const recipient = (msg['To'] || msg['to'] || msg['Recipient'] || msg['recipient'] || '') as string;
          if (sender) usernames.add(sender);
          if (recipient) usernames.add(recipient);
        }
      }
      return;
    }

    // Also check object keys as potential usernames/chat names
    const objRecord = obj as Record<string, unknown>;
    for (const [key, value] of Object.entries(objRecord)) {
      if (Array.isArray(value) && value.length > 0) {
        usernames.add(key);
      }
      extract(value);
    }
  };

  extract(data);
  return Array.from(usernames).filter(u => u.length > 0).sort();
}

export const useChatStore = create<ChatState>()((set, get) => ({
  rawData: null,
  availableUsers: [],
  selectedUser: null,
  monthGroups: [],
  activeMonth: null,
  searchQuery: '',
  isProcessing: false,
  fileName: null,

  setRawData: (data, fileName) => {
    const users = extractUsernames(data);
    set({ rawData: data as Record<string, unknown>, availableUsers: users, fileName, selectedUser: null, monthGroups: [], activeMonth: null });
  },

  selectUser: (username) => {
    set({ isProcessing: true });
    // Use setTimeout so UI can show loading state
    setTimeout(() => {
      const { rawData } = get();
      if (!rawData) return;
      const groups = parseSnapchatData(rawData, username);
      set({
        selectedUser: username,
        monthGroups: groups,
        activeMonth: groups[0]?.key || null,
        isProcessing: false,
      });
    }, 50);
  },

  setActiveMonth: (monthKey) => set({ activeMonth: monthKey }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set({ rawData: null, availableUsers: [], selectedUser: null, monthGroups: [], activeMonth: null, searchQuery: '', fileName: null }),
}));
