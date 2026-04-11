import { useEffect, useRef, useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import { format, isSameDay } from 'date-fns';
import { MessageSquare } from 'lucide-react';

const ChatPanel = () => {
  const { monthGroups, activeMonth, selectedUser } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeGroup = monthGroups.find((g) => g.key === activeMonth);

  // Group messages by day for date separators
  const dayGroups = useMemo(() => {
    if (!activeGroup) return [];
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
  }, [activeGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMonth]);

  if (!activeGroup) {
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
    <div className="flex-1 flex flex-col min-w-0">
      {/* Chat header */}
      <div className="h-14 bg-chat-header border-b border-border flex items-center px-4 shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{activeGroup.label}</h3>
          <p className="text-xs text-muted-foreground">{activeGroup.messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-pattern px-4 py-4 scrollbar-thin">
        {dayGroups.map((day, di) => (
          <div key={di}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 rounded-lg bg-chat-date-badge text-xs text-muted-foreground font-medium shadow-sm">
                {format(day.date, 'MMMM d, yyyy')}
              </span>
            </div>

            {day.messages.map((msg, mi) => {
              const isSent = msg.sender.toLowerCase() === selectedUser?.toLowerCase();
              return (
                <div
                  key={`${di}-${mi}`}
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
                    {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    <p className="text-[10px] opacity-60 text-right mt-0.5 -mb-0.5">
                      {format(msg.timestamp, 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPanel;
