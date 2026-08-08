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

    // Construction du message à pré-remplir
    const description = `
Utilisateur:
- Email: ${user.email}
- ID Snapchat: ${user.snapId}
- Téléphone: ${user.phone}

Ami:
- Nom: ${friend.name}
- ID Snapchat: ${friend.snapId}

Demande de restauration de flammes avec cet ami.
    `.trim();

    // URL du formulaire Snapchat avec pré-remplissage Zendesk
    const formUrl = new URL('https://help.snapchat.com/hc/en-gb/requests/new');
    formUrl.searchParams.set('co', 'true');
    formUrl.searchParams.set('ticket_form_id', '149423');
    formUrl.searchParams.set('ticket[subject]', `Restauration flammes avec ${friend.name}`);
    formUrl.searchParams.set('ticket[description]', description);
    formUrl.searchParams.set('ticket[requester][email]', user.email);

    // Copier aussi automatiquement dans le presse-papiers
    try {
      await navigator.clipboard.writeText(description);
    } catch (e) {
      // Silencieusement ignoré si la copie échoue
    }

    // Ouvrir la fenêtre
    const window_ref = window.open(formUrl.toString(), 'snapchat_form', 'width=800,height=600');

    if (window_ref) {
      setMessage('✓ Formulaire ouvert. Les données sont pré-remplies et copiées dans le presse-papiers. Complétez et envoyez.');
    } else {
      setMessage('Impossible d\'ouvrir le formulaire. Vérifiez les pop-ups.');
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
        <p className="subtitle">Un clic pour pré-remplir automatiquement le formulaire Snapchat.</p>
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
        <p className="small-text">Votre formulaire s'ouvrira automatiquement avec vos données pré-remplies. Vous pouvez aussi copier manuellement les données de votre côté.</p>
        <div className="button-row">
          <button className="primary" onClick={handleSubmit}>Restaurer avec cet ami</button>
          <button className="secondary" onClick={copyToClipboard}>Copier les données</button>
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => router.push('/dashboard')}>Retour</button>
        </div>
        {message && <div className="alert">{message}</div>}
      </section>
    </main>
  );
}
