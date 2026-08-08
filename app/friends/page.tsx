'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Friend = { id: string; name: string; snapId: string };

type UserData = {
  email: string;
  snapId: string;
  phone: string;
  friends: Friend[];
};

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [form, setForm] = useState({ name: '', snapId: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/user');
      if (res.status === 401) return router.push('/');
      const data = await res.json();
      setFriends(data.user.friends);
      setLoading(false);
    };
    load();
  }, [router]);

  const refresh = async () => {
    const res = await fetch('/api/user');
    if (res.status === 401) return router.push('/');
    const data = await res.json();
    setFriends(data.user.friends);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de l’ajout');
      setForm({ name: '', snapId: '' });
      refresh();
      setMessage('Ami ajouté.');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const removeFriend = async (id: string) => {
    await fetch(`/api/friends/${id}`, { method: 'DELETE' });
    refresh();
  };

  if (loading) {
    return <main><div className="card"><p>Chargement...</p></div></main>;
  }

  return (
    <main>
      <div className="header">
        <h1>Mes amis</h1>
        <p className="subtitle">Ajoutez, modifiez ou supprimez les amis liés à vos flammes Snapchat.</p>
      </div>

      <section className="card">
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Nom de l'ami
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" required />
          </label>
          <label>
            ID Snapchat de l'ami
            <input value={form.snapId} onChange={(event) => setForm({ ...form, snapId: event.target.value })} type="text" required />
          </label>
          <button className="primary">Ajouter l’ami</button>
        </form>
      </section>

      <section className="card">
        <h2>Liste des amis</h2>
        {friends.length === 0 ? (
          <p className="small-text">Aucun ami enregistré pour l’instant.</p>
        ) : (
          <div className="list-card">
            {friends.map((friend) => (
              <div key={friend.id} className="list-item">
                <div>
                  <strong>{friend.name}</strong>
                  <div className="small-text">Snap : {friend.snapId}</div>
                </div>
                <div className="button-row">
                  <button className="secondary" onClick={() => router.push(`/form?friendId=${friend.id}`)}>
                    Restaurer
                  </button>
                  <button className="secondary" onClick={() => removeFriend(friend.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {message && <div className="alert">{message}</div>}
    </main>
  );
}
