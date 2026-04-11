import { useChatStore } from '@/store/chatStore';
import { Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const ChatSidebar = () => {
  const { monthGroups, activeMonth, setActiveMonth, searchQuery, setSearchQuery, selectedUser, reset } = useChatStore();

  const filtered = monthGroups.filter((g) =>
    g.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-chat-sidebar border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-lg truncate">{selectedUser}</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search months..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-0 h-9 text-sm"
          />
        </div>
      </div>

      {/* Month list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveMonth(group.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-border/50 ${
              activeMonth === group.key ? 'bg-muted' : 'hover:bg-secondary'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{group.label}</span>
                <span className="text-xs text-muted-foreground">
                  {format(group.lastMessage.timestamp, 'MMM d')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {group.messages.length} messages · {group.lastMessage.content || '[media]'}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No months found</p>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
