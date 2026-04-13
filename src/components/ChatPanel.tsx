import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { format, isSameDay } from 'date-fns';
import { MessageSquare, Search, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { openChatSidebar } from '@/components/ChatSidebar';

// ─── Highlight helper ────────────────────────────────────────────────────────
// Splits text around every case-insensitive match and wraps matches in <mark>.
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
const ChatPanel = () => {
  const {
    monthGroups,
    activeMonth,
    selectedUser,
    messageSearchQuery,
    setMessageSearchQuery,
    setActiveMonth,
  } = useChatStore();

  const scrollRef    = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  const activeGroup  = monthGroups.find((g) => g.key === activeMonth);
  const isSearching  = messageSearchQuery.trim().length > 0;

  // ── Search results: match across ALL months ──────────────────────────────
  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const q = messageSearchQuery.toLowerCase();
    const results: { monthLabel: string; monthKey: string; messages: typeof monthGroups[0]['messages'] }[] = [];

    // monthGroups is sorted latest-first; reverse so results read oldest-first
    const sorted = [...monthGroups].reverse();

    for (const group of sorted) {
      const matched = group.messages.filter((msg) =>
        msg.content.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        results.push({ monthLabel: group.label, monthKey: group.key, messages: matched });
      }
    }

    return results;
  }, [messageSearchQuery, monthGroups, isSearching]);

  const totalMatches = searchResults.reduce((n, r) => n + r.messages.length, 0);

  // ── Normal view: group active month messages by day ──────────────────────
  const dayGroups = useMemo(() => {
    if (!activeGroup || isSearching) return [];
    const groups: { date: Date; messages: typeof activeGroup.messages }[] = [];
    for (const msg of activeGroup.messages) {
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, msg.timestamp)) {
        last.messages.push(msg);
      } else {
        groups.push({ date: msg.timestamp, messages: [msg] });
      }
    }
    return groups;
  }, [activeGroup, isSearching]);

  // Scroll to bottom when switching months (not during search)
  useEffect(() => {
    if (!isSearching && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMonth, isSearching]);

  const clearSearch = useCallback(() => {
    setMessageSearchQuery('');
    searchRef.current?.focus();
  }, [setMessageSearchQuery]);

  // ── Bubble renderer (shared between normal and search view) ─────────────
  const renderBubble = (
    msg: NonNullable<typeof activeGroup>['messages'][0],
    key: string,
    query: string
  ) => {
    const isSent = msg.isSender;
    return (
      <div
        key={key}
        className={`flex mb-1.5 animate-fade-in ${isSent ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[75%] px-3 py-1.5 rounded-lg text-sm relative ${
            isSent
              ? 'bg-chat-bubble-sent text-chat-bubble-sent-fg rounded-tr-sm'
              : 'bg-chat-bubble-received text-chat-bubble-received-fg rounded-tl-sm'
          }`}
        >
          {!isSent && (
            <p className="text-xs font-semibold text-primary mb-0.5">{msg.sender}</p>
          )}
          {msg.mediaType && !msg.content && (
            <p className="italic opacity-70">📎 {msg.mediaType}</p>
          )}
          {msg.content && (
            <p className="whitespace-pre-wrap break-words">
              <HighlightedText text={msg.content} query={query} />
            </p>
          )}
          <p className="text-[10px] opacity-60 text-right mt-0.5 -mb-0.5">
            {format(msg.timestamp, 'h:mm a')}
          </p>
        </div>
      </div>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!activeGroup && !isSearching) {
    return (
      <div className="flex-1 flex items-center justify-center chat-pattern">
        <div className="text-center text-muted-foreground animate-fade-in">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a month to view chat</p>
          <p className="text-sm mt-1">Choose from the sidebar on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

      {/* ── Chat header ── */}
      <div className="bg-chat-header border-b border-border shrink-0">
        {/* Top row: hamburger (mobile) + icon + title + message count */}
        <div className="h-14 flex items-center px-4 gap-3">
          {/* Hamburger — mobile only, integrated naturally into the header */}
          <button
            onClick={openChatSidebar}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors shrink-0 -ml-1"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{selectedUser}</h3>
            {isSearching ? (
              <p className="text-xs text-muted-foreground">
                {totalMatches === 0
                  ? 'No results'
                  : `${totalMatches} result${totalMatches !== 1 ? 's' : ''}`}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {activeGroup!.label} · {activeGroup!.messages.length} messages
              </p>
            )}
          </div>
        </div>

        {/* Search bar row */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchRef}
              placeholder="Search in chat…"
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-secondary border-0 h-9 text-sm"
            />
            {isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-pattern px-4 py-4 scrollbar-thin">

        {/* ── SEARCH RESULTS VIEW ── */}
        {isSearching && (
          <>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No messages match "{messageSearchQuery}"</p>
              </div>
            ) : (
              searchResults.map((group) => (
                <div key={group.monthKey}>
                  {/* Month label — clicking it navigates to that month */}
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <button
                      onClick={() => {
                        setActiveMonth(group.monthKey);
                        setMessageSearchQuery('');
                      }}
                      className="px-3 py-1 rounded-lg bg-chat-date-badge text-xs text-muted-foreground font-medium shadow-sm hover:text-foreground transition-colors"
                    >
                      {group.monthLabel} ↗
                    </button>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {group.messages.map((msg, mi) =>
                    renderBubble(msg, `${group.monthKey}-${mi}`, messageSearchQuery)
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* ── NORMAL MONTH VIEW ── */}
        {!isSearching &&
          dayGroups.map((day, di) => (
            <div key={di}>
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 rounded-lg bg-chat-date-badge text-xs text-muted-foreground font-medium shadow-sm">
                  {format(day.date, 'MMMM d, yyyy')}
                </span>
              </div>
              {day.messages.map((msg, mi) =>
                renderBubble(msg, `${di}-${mi}`, '')
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChatPanel;