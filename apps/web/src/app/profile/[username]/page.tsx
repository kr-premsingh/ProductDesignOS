"use client";

import { useEffect, useState } from 'react';
import { inspireTiles } from "@/lib/mock-data";
import { useAuth } from '@/lib/auth';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${params.username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile || data);
        }
      } catch (err) {}
    }
    load();
    (async () => {
      try {
        if (isOwner && token) {
          const res = await fetch('/api/me/saved', { headers: { authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            const ids = (data.items || []).map((i: any) => i.id);
            setSaved(ids);
            return;
          }
        }
      } catch (err) {}
      try {
        const savedSet = JSON.parse(localStorage.getItem('saved') || '[]');
        setSaved(Array.isArray(savedSet) ? savedSet : []);
      } catch (err) {
        setSaved([]);
      }
    })();
  }, [params.username]);

  const isOwner = user?.username === params.username;

  return (
    <main>
      <section className="relative min-h-[360px] overflow-hidden">
        <img src="https://picsum.photos/seed/nova-hero/1600/800" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end px-4 pb-10">
          <span className="mb-3 w-fit rounded-full bg-cyan px-3 py-1 text-xs font-semibold uppercase text-charcoal">{profile?.role || 'Student'}</span>
          <h1 className="text-5xl font-black">@{params.username}</h1>
          <p className="mt-3 max-w-xl text-muted">{profile?.bio || 'Identity systems with pulse.'}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Showcase</h2>
          {isOwner ? <button className="rounded-full bg-white/6 px-3 py-2">Manage items</button> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {inspireTiles.slice(0, 6).map((tile) => (
            <article key={tile.id} className="overflow-hidden rounded-card border border-white/10 bg-white/6">
              <img src={tile.image} alt="" className="h-64 w-full object-cover" />
              <div className="p-4">
                <h2 className="font-semibold">{tile.title}</h2>
                <p className="mt-1 text-sm text-muted">{tile.category}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold">Saved</h3>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {saved.length ? (
              saved.map((id) => {
                const tile = inspireTiles.find((t) => t.id === id);
                if (!tile) return null;
                return (
                  <article key={tile.id} className="overflow-hidden rounded-card border border-white/10 bg-white/6">
                    <img src={tile.image} alt="" className="h-64 w-full object-cover" />
                    <div className="p-4">
                      <h2 className="font-semibold">{tile.title}</h2>
                      <p className="mt-1 text-sm text-muted">{tile.category}</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="text-muted">No saved items yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
