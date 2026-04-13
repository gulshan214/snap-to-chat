import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { Search, MessageSquare, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

// Module-level setter so ChatPanel can open the sidebar without prop drilling
let _setOpen: ((v: boolean) => void) | null = null;
export const openChatSidebar = () => _setOpen?.(true);

const ChatSidebar = () => {
  const { monthGroups, activeMonth, setActiveMonth, searchQuery, setSearchQuery, selectedUser, reset } = useChatStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Register the setter on every render so it's always current
  _setOpen = setIsOpen;

  const handleBack = () => {
    navigate('/');
    reset();
  };

  const filtered = monthGroups.filter((g) =>
    g.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-chat-sidebar border-r border-border z-50
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:h-full md:shrink-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-base truncate">{selectedUser}</h2>
          </div>
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search months..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-0 h-9 text-sm"
            />
          </div>
        </div>

        {/* Month list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No months found</p>
          ) : (
            filtered.map((group) => (
              <button
                key={group.key}
                onClick={() => {
                  setActiveMonth(group.key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-border/50 ${
                  activeMonth === group.key ? 'bg-muted' : 'hover:bg-secondary'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-sm truncate">{group.label}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(group.lastMessage.timestamp, 'MMM d')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {group.messages.length} messages · {group.lastMessage.content || '[media]'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;