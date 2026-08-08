'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserData = {
  email: string;
  snapId: string;
  phone: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({ email: '', snapId: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/user');
      if (res.status === 401) return router.push('/');
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur de sauvegarde');
      setMessage('Paramètres mis à jour.');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return <main><div className="card"><p>Chargement...</p></div></main>;
  }

  return (
    <main>
      <div className="header">
        <h1>Paramètres</h1>
        <p className="subtitle">Modifiez votre compte et vos informations Snapchat à tout moment.</p>
      </div>

      <section className="card">
        <form className="form-grid" onSubmit={handleSave}>
          <label>
            Email
            <input value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} type="email" required />
          </label>
          <label>
            ID Snapchat
            <input value={user.snapId} onChange={(event) => setUser({ ...user, snapId: event.target.value })} type="text" required />
          </label>
          <label>
            Téléphone
            <input value={user.phone} onChange={(event) => setUser({ ...user, phone: event.target.value })} type="tel" required />
          </label>

          <div className="button-row">
            <button className="primary" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            <button type="button" className="secondary" onClick={logout}>Déconnexion</button>
          </div>
        </form>

        {message && <div className="alert">{message}</div>}
      </section>
    </main>
  );
}
