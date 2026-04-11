import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { LogOut, MessageSquare } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import UserSelector from '@/components/UserSelector';
import ChatSidebar from '@/components/ChatSidebar';
import ChatPanel from '@/components/ChatPanel';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { rawData, selectedUser, availableUsers } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const showUpload = !rawData;
  const showUserSelect = rawData && !selectedUser && availableUsers.length > 0;
  const showChat = rawData && selectedUser;

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">SnapChat Viewer</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); navigate('/'); }}
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {showUpload && (
          <div className="flex-1 flex items-center justify-center p-6">
            <FileUpload />
          </div>
        )}

        {showUserSelect && (
          <div className="flex-1 flex items-center justify-center p-6">
            <UserSelector />
          </div>
        )}

        {showChat && (
          <>
            {/* Sidebar toggle for mobile */}
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
