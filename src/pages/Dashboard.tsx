import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { MessageSquare } from 'lucide-react';
import UserSelector from '@/components/UserSelector';
import ChatSidebar from '@/components/ChatSidebar';
import ChatPanel from '@/components/ChatPanel';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { rawData, selectedUser, availableUsers, reset } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showUserSelect = rawData && !selectedUser && availableUsers.length > 0;
  const showChat = rawData && selectedUser;

  const handleBack = () => {
    navigate('/');
    reset();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">SnapChat Viewer</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground h-8 text-xs"
        >
          ← Back
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {showUserSelect && (
          <div className="flex-1 flex items-center justify-center p-6">
            <UserSelector />
          </div>
        )}

        {showChat && (
          <>
            <div
              className={`${
                sidebarOpen ? 'w-80' : 'w-0'
              } transition-all duration-300 overflow-hidden shrink-0 border-r border-border`}
            >
              <ChatSidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="sm:hidden p-2 bg-card border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-xs"
                >
                  {sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                </Button>
              </div>
              <ChatPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;