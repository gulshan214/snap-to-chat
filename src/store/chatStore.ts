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
  key: string;
  label: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
}

interface ChatState {
  rawData: Record<string, unknown> | null;
  availableUsers: string[];
  selectedUser: string | null;
  monthGroups: MonthGroup[];
  activeMonth: string | null;
  searchQuery: string;           // used by sidebar to filter month labels
  messageSearchQuery: string;    // ✅ NEW: used by ChatPanel to search within messages
  isProcessing: boolean;
  fileName: string | null;

  setRawData: (data: Record<string, unknown>, fileName: string) => void;
  selectUser: (username: string) => void;
  setActiveMonth: (monthKey: string) => void;
  setSearchQuery: (query: string) => void;
  setMessageSearchQuery: (query: string) => void; // ✅ NEW
  reset: () => void;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function parseSnapchatData(data: Record<string, unknown>, username: string): MonthGroup[] {
  const messages: ChatMessage[] = [];

  const getRawArray = (): unknown[] => {
    if (Array.isArray(data[username])) {
      return data[username] as unknown[];
    }

    const lowerUsername = username.toLowerCase();
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase() === lowerUsername && Array.isArray(value)) {
        return value as unknown[];
      }
    }

    const all: unknown[] = [];
    const collect = (obj: unknown): void => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) { all.push(...obj); return; }
      for (const v of Object.values(obj as Record<string, unknown>)) collect(v);
    };
    collect(data);
    return all;
  };

  const rawArray = getRawArray();

  for (const item of rawArray) {
    if (!item || typeof item !== 'object') continue;

    const msg = item as Record<string, unknown>;

    const sender       = (msg['From']    || msg['from']    || msg['Sender']    || msg['sender']    || msg['sender_name'] || '') as string;
    const content      = (msg['Content'] || msg['content'] || msg['Text']      || msg['text']      || msg['message']     || msg['body'] || '') as string;
    const timestampRaw = msg['Created']  || msg['created'] || msg['timestamp'] || msg['date']      || msg['created_at']  || msg['Created Date'] || '';
    const mediaType    = (msg['Media Type'] || msg['media_type'] || msg['type'] || '') as string;

    const isSenderRaw  = msg['IsSender'] ?? msg['is_sender'] ?? msg['isSender'];
    const isSender: boolean = typeof isSenderRaw === 'boolean' ? isSenderRaw : false;

    if (!content && !mediaType) continue;
    if (mediaType === 'STATUSERASEDMESSAGE' && !content) continue;

    messages.push({
      sender,
      content,
      timestamp: new Date(timestampRaw as string),
      mediaType,
      isSender,
    });
  }

  messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const groups = new Map<string, ChatMessage[]>();

  for (const msg of messages) {
    if (isNaN(msg.timestamp.getTime())) continue;
    const month = MONTH_NAMES[msg.timestamp.getMonth()];
    const year  = msg.timestamp.getFullYear();
    const key   = `${month}_${year}`;
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

  monthGroups.sort(
    (a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
  );

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
          const sender    = (msg['From'] || msg['from'] || msg['Sender'] || msg['sender'] || msg['sender_name'] || '') as string;
          const recipient = (msg['To']   || msg['to']   || msg['Recipient'] || msg['recipient'] || '') as string;
          if (sender)    usernames.add(sender);
          if (recipient) usernames.add(recipient);
        }
      }
      return;
    }

    const objRecord = obj as Record<string, unknown>;
    for (const [key, value] of Object.entries(objRecord)) {
      if (Array.isArray(value) && value.length > 0) usernames.add(key);
      extract(value);
    }
  };

  extract(data);
  return Array.from(usernames).filter(u => u.length > 0).sort();
}

export const useChatStore = create<ChatState>()((set, get) => ({
  rawData:             null,
  availableUsers:      [],
  selectedUser:        null,
  monthGroups:         [],
  activeMonth:         null,
  searchQuery:         '',
  messageSearchQuery:  '',   // ✅ NEW
  isProcessing:        false,
  fileName:            null,

  setRawData: (data, fileName) => {
    const users = extractUsernames(data);
    set({
      rawData: data as Record<string, unknown>,
      availableUsers: users,
      fileName,
      selectedUser:       null,
      monthGroups:        [],
      activeMonth:        null,
      messageSearchQuery: '',  // ✅ clear on new file
    });
  },

  selectUser: (username) => {
    // ✅ Clear message search when switching conversations
    set({ isProcessing: true, messageSearchQuery: '' });

    setTimeout(() => {
      const { rawData } = get();
      if (!rawData) return;

      const groups = parseSnapchatData(rawData as Record<string, unknown>, username);

      set({
        selectedUser: username,
        monthGroups:  groups,
        activeMonth:  groups[0]?.key || null,
        isProcessing: false,
      });
    }, 50);
  },

  setActiveMonth:         (monthKey) => set({ activeMonth: monthKey }),
  setSearchQuery:         (query)    => set({ searchQuery: query }),
  setMessageSearchQuery:  (query)    => set({ messageSearchQuery: query }), // ✅ NEW

  reset: () =>
    set({
      rawData:            null,
      availableUsers:     [],
      selectedUser:       null,
      monthGroups:        [],
      activeMonth:        null,
      searchQuery:        '',
      messageSearchQuery: '',
      fileName:           null,
    }),
}));