import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MessageSquare, Upload, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, signup } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ FIXED: navigate must be inside useEffect, not called during render
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isLogin) {
      login(email, password);
    } else {
      if (!name) { setError('Please enter your name'); return; }
      signup(email, name, password);
    }
    // navigate happens automatically via the useEffect above
  };

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

      {/* Right - Auth form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">SnapChat Viewer</h1>
          </div>

          <h3 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome back' : 'Create account'}</h3>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Sign in to continue' : 'Get started for free'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border h-11"
              />
            )}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border h-11"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-11 font-semibold gap-2">
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;