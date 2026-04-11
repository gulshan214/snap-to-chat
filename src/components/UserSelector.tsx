import { useChatStore } from '@/store/chatStore';
import { User, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserSelector = () => {
  const { availableUsers, selectUser, isProcessing, reset, fileName } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="max-w-lg w-full">
        <Button variant="ghost" onClick={reset} className="mb-6 text-muted-foreground gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to upload
        </Button>

        <h2 className="text-2xl font-bold mb-2">Select a User</h2>
        <p className="text-muted-foreground mb-2">
          Found <span className="text-primary font-semibold">{availableUsers.length}</span> users in{' '}
          <span className="text-foreground font-medium">{fileName}</span>
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Choose whose chat you want to view:
        </p>

        {isProcessing ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Processing messages...</span>
          </div>
        ) : (
          <div className="grid gap-2 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
            {availableUsers.map((user) => (
              <button
                key={user}
                onClick={() => selectUser(user)}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-muted transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium truncate">{user}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelector;
