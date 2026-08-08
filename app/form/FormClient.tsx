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

  const copyToClipboard = async () => {
    if (!user || !friend) return;
    const text = `
Utilisateur:
- Email: ${user.email}
- ID Snapchat: ${user.snapId}
- Téléphone: ${user.phone}

Ami:
- Nom: ${friend.name}
- ID Snapchat: ${friend.snapId}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setMessage('✓ Données copiées dans le presse-papiers !');
    } catch (e) {
      setMessage('Erreur lors de la copie.');
    }
  };

  const handleSubmit = async () => {
    if (!friend || !user) return;
    setMessage('Envoi du formulaire en cours...');

    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: friend.id }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
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
        <h1>Restauration de flammes</h1>
        <p className="subtitle">Un clic pour envoyer automatiquement votre demande à Snapchat.</p>
      </div>

      <section className="card">
        <h2>Vos informations</h2>
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>ID Snapchat :</strong> {user?.snapId}</p>
        <p><strong>Téléphone :</strong> {user?.phone}</p>
      </section>

      <section className="card">
        <h2>Ami à ajouter</h2>
        <p><strong>Nom :</strong> {friend?.name}</p>
        <p><strong>ID Snapchat :</strong> {friend?.snapId}</p>
      </section>

      <section className="card">
        <p className="small-text">Cliquez pour envoyer automatiquement votre demande de restauration de flammes à Snapchat.</p>
        <div className="button-row">
          <button className="primary" onClick={handleSubmit}>Envoyer automatiquement</button>
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => router.push('/dashboard')}>Retour</button>
        </div>
        {message && <div className="alert">{message}</div>}
      </section>
    </main>
  );
}
