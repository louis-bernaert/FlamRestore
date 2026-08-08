'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fetchJson = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Erreur réseau');
  return result;
};

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snapId, setSnapId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await fetchJson('/api/auth/sign-in', { email, password });
      } else {
        await fetchJson('/api/auth/sign-up', { email, password, snapId, phone });
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="header">
        <h1>SnapFlam Restore</h1>
        <p className="subtitle">Créez votre compte et préparez la restauration des flammes Snapchat rapidement.</p>
      </div>

      <section className="card">
        <div className="button-row">
          <button type="button" className={mode === 'login' ? 'primary' : 'secondary'} onClick={() => setMode('login')}>
            Connexion
          </button>
          <button type="button" className={mode === 'register' ? 'primary' : 'secondary'} onClick={() => setMode('register')}>
            Inscription
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>

          <label>
            Mot de passe
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>

          {mode === 'register' && (
            <>
              <label>
                Votre ID Snapchat
                <input value={snapId} onChange={(event) => setSnapId(event.target.value)} type="text" required />
              </label>
              <label>
                Numéro de téléphone
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" required />
              </label>
            </>
          )}

          <div className="button-row">
            <button className="primary" disabled={loading}>
              {loading ? 'En cours...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </div>

          {error && <div className="alert">{error}</div>}
        </form>
      </section>

      <section>
        <div className="card">
          <h2>Comment ça marche</h2>
          <p className="small-text">
            Après inscription, vous pouvez enregistrer votre compte Snapchat et ajouter des amis avec qui vous souhaitez restaurer des flammes.
            Chaque ami a une fiche dédiée pour générer une demande de restauration simple et claire.
          </p>
        </div>
      </section>
    </main>
  );
}
