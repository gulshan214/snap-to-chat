import { MessageSquare, Upload, Eye } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const Landing = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 bg-card">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">SnapChat Viewer</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            View your Snapchat chats like
            <span className="text-primary"> WhatsApp</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Upload your Snapchat JSON backup and browse conversations in a beautiful, familiar interface organized by month.
          </p>
          <div className="space-y-4">
            {[
              { icon: Upload, text: 'Upload your Snapchat JSON export' },
              { icon: Eye,    text: 'Select a conversation to view' },
              { icon: MessageSquare, text: 'Browse chats in WhatsApp-style UI' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-secondary-foreground">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - File Upload */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">SnapChat Viewer</h1>
        </div>

        <div className="w-full max-w-md">
          <FileUpload />
        </div>
      </div>
    </div>
  );
};

export default Landing;