"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      if (mode === 'login') {
        await login(String(fd.get('username') || ''), String(fd.get('password') || ''));
      } else {
        await signup(String(fd.get('username') || ''), String(fd.get('email') || ''), String(fd.get('password') || ''), String(fd.get('role') || 'user'));
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed');
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-4">
      <div className="glass-panel w-full max-w-md rounded-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode === 'login' ? 'Sign in' : 'Create account'}</h3>
          <button aria-label="Close" className="rounded-full p-2 hover:bg-white/10" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="mb-3 flex gap-2">
          <button onClick={() => setMode('login')} className={`rounded-full px-3 py-1 ${mode === 'login' ? 'bg-cyan text-charcoal' : 'bg-white/6'}`}>Login</button>
          <button onClick={() => setMode('signup')} className={`rounded-full px-3 py-1 ${mode === 'signup' ? 'bg-cyan text-charcoal' : 'bg-white/6'}`}>Sign up</button>
        </div>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          {mode === 'signup' && <input name="email" type="email" placeholder="Email" className="rounded-card border border-white/10 bg-white/8 px-3 py-3" required />}
          <input name="username" placeholder="Username" className="rounded-card border border-white/10 bg-white/8 px-3 py-3" required />
          <input name="password" type="password" placeholder="Password" className="rounded-card border border-white/10 bg-white/8 px-3 py-3" required />
          {mode === 'signup' && (
            <select name="role" className="rounded-card border border-white/10 bg-white/8 px-3 py-3">
              <option value="user">Just exploring</option>
              <option value="creator">Creator</option>
              <option value="provider">Provider</option>
            </select>
          )}
          {error ? <div className="text-sm text-magenta">{error}</div> : null}
          <div className="mt-2 flex justify-end">
            <button type="submit" className="rounded-full bg-cyan px-4 py-2 font-semibold text-charcoal">{mode === 'login' ? 'Sign in' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
