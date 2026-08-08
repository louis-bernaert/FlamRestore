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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.status === 401) return router.push('/');
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) {
    return <main><div className="card"><p>Chargement...</p></div></main>;
  }

  if (!user) {
    return <main><div className="card"><p>Redirection vers la connexion...</p></div></main>;
  }

  return (
    <main>
      <div className="header">
        <h1>Tableau de bord</h1>
        <p className="subtitle">Votre espace personnel pour gérer le compte et les amis Snapchat.</p>
      </div>

      <section className="card">
        <div>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>ID Snapchat :</strong> {user.snapId}</p>
          <p><strong>Téléphone :</strong> {user.phone}</p>
        </div>
        <nav>
          <a href="/settings">Paramètres</a>
          <a href="/friends">Mes amis</a>
          <a href="/form">Restauration</a>
        </nav>
      </section>

      <section className="card">
        <h2>Flammes enregistrées</h2>
        {user.friends.length === 0 ? (
          <p className="small-text">Ajoutez des amis depuis la page « Mes amis » pour préparer la restauration de flammes.</p>
        ) : (
          <div className="list-card">
            {user.friends.map((friend) => (
              <div key={friend.id} className="list-item">
                <div>
                  <strong>{friend.name}</strong>
                  <div className="small-text">Snap : {friend.snapId}</div>
                </div>
                <button className="secondary" onClick={() => router.push(`/form?friendId=${friend.id}`)}>
                  Ouvrir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <div className="alert">{error}</div>}
    </main>
  );
}
