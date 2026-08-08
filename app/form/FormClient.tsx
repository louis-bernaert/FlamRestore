'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Friend = { id: string; name: string; snapId: string };
type UserData = { email: string; snapId: string; phone: string; friends: Friend[] };

type FormClientProps = { friendId: string };

export default function FormClient({ friendId }: FormClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!user || !friendId) return;
    setFriend(user.friends.find((item) => item.id === friendId) ?? null);
  }, [user, friendId]);

  const restoreReady = useMemo(() => {
    return user && friend;
  }, [user, friend]);

  const handleSubmit = async () => {
    if (!friend) return;
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: friend.id }),
    });
    const result = await res.json();
    if (res.ok) {
      setMessage(result.message);
      window.open('https://help.snapchat.com/hc/en-gb/requests/new?co=true&ticket_form_id=149423', '_blank');
    } else {
      setMessage(result.message || 'Impossible de préparer la demande.');
    }
  };

  if (loading) {
    return <main><div className="card"><p>Chargement...</p></div></main>;
  }

  if (!restoreReady) {
    return (
      <main>
        <div className="card">
          <h1>Restauration de flammes</h1>
          <p className="small-text">Choisissez un ami depuis votre tableau de bord ou la page « Mes amis » pour remplir la demande.</p>
          <button className="primary" onClick={() => router.push('/friends')}>Retour aux amis</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="header">
        <h1>Préparer la restauration</h1>
        <p className="subtitle">Votre formulaire sera prêt avec les informations de l’ami sélectionné.</p>
      </div>

      <section className="card">
        <p><strong>Utilisateur :</strong> {user?.email}</p>
        <p><strong>ID Snapchat :</strong> {user?.snapId}</p>
        <p><strong>Téléphone :</strong> {user?.phone}</p>
      </section>

      <section className="card">
        <h2>Ami</h2>
        <p><strong>Nom :</strong> {friend?.name}</p>
        <p><strong>ID Snapchat :</strong> {friend?.snapId}</p>
      </section>

      <section className="card">
        <p className="small-text">Cliquez sur le bouton ci-dessous pour ouvrir le formulaire Snapchat officiel. Les données sont prêtes et vous pouvez les copier.</p>
        <div className="button-row">
          <button className="primary" onClick={handleSubmit}>Préparer et ouvrir le formulaire</button>
          <button className="secondary" onClick={() => router.push('/dashboard')}>Retour au tableau de bord</button>
        </div>
        {message && <div className="alert">{message}</div>}
      </section>
    </main>
  );
}
