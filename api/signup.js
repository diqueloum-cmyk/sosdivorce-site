import { addUser, findUserByEmail, getAllUsers, getStats } from '../lib/database.js';

export default async function handler(req, res) {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Retourner les statistiques
    try {
      const stats = getStats();
      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, firstName, lastName, email, password } = req.body;

    // Gérer différentes actions
    if (action === 'register') {
      return await handleRegister(firstName, lastName, email, res);
    } else if (action === 'login') {
      return await handleLogin(email, password, res);
    } else if (action === 'check') {
      return await handleCheckUser(req, res);
    } else if (action === 'list') {
      return await handleListUsers(res);
    } else if (action === 'stats') {
      return await handleStats(res);
    } else {
      // Inscription par défaut (pour compatibilité)
      return await handleRegister(firstName, lastName, email, res);
    }

  } catch (error) {
    console.error('Signup API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      ok: false 
    });
  }
}

async function handleRegister(firstName, lastName, email, res) {
  // Validation des données
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ 
      error: 'Tous les champs sont obligatoires',
      ok: false 
    });
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Format d\'email invalide',
      ok: false 
    });
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ 
      error: 'Cet email est déjà utilisé',
      ok: false 
    });
  }

  // Sauvegarder en base de données locale
  const user = addUser({ firstName, lastName, email });

  // Envoyer vers Google Sheets via webhook
  try {
    const SHEET_ID = '1cfJApHpVD1bIbb9IWrePIIO1j0YhjNjBmOLB7S8Mhzk';
    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;

    if (webhookUrl) {
      const registeredAt = new Date().toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Envoyer via webhook (Make.com ou Zapier)
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: lastName,
          prenom: firstName,
          email: email,
          date: registeredAt
        })
      }).catch(err => console.error('Erreur Google Sheets:', err));
    }
  } catch (error) {
    console.error('Erreur envoi Google Sheets:', error);
    // Ne pas bloquer l'inscription si Google Sheets échoue
  }

  // Définir les cookies d'inscription
  const oneYear = 365 * 24 * 60 * 60; // 1 an en secondes
  
  res.setHeader('Set-Cookie', [
    `registered=1; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `q_used=0; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `user_name=${encodeURIComponent(firstName)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `user_email=${encodeURIComponent(email)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`
  ]);

  console.log('Nouvelle inscription:', { firstName, lastName, email, timestamp: new Date().toISOString() });

  return res.status(200).json({
    ok: true,
    message: 'Inscription réussie ! Vous pouvez maintenant poser des questions illimitées.',
    user: {
      id: user.id,
      firstName,
      lastName,
      email
    }
  });
}

async function handleLogin(email, password, res) {
  // Validation des données
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email et mot de passe requis',
      success: false 
    });
  }

  // Rechercher l'utilisateur
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ 
      error: 'Utilisateur non trouvé',
      success: false 
    });
  }

  // Définir les cookies de connexion
  const oneYear = 365 * 24 * 60 * 60; // 1 an en secondes
  
  res.setHeader('Set-Cookie', [
    `registered=1; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `q_used=0; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `user_name=${encodeURIComponent(user.firstName)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
    `user_email=${encodeURIComponent(email)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`
  ]);

  return res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  });
}

async function handleCheckUser(req, res) {
  // Lire les cookies pour vérifier l'utilisateur
  const cookies = req.headers.cookie || '';
  const userEmail = cookies.match(/user_email=([^;]+)/)?.[1];
  
  if (!userEmail) {
    return res.status(200).json({ success: false });
  }

  const user = findUserByEmail(decodeURIComponent(userEmail));
  if (!user) {
    return res.status(200).json({ success: false });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  });
}

async function handleListUsers(res) {
  const users = getAllUsers();
  return res.status(200).json({
    success: true,
    users
  });
}

async function handleStats(res) {
  const stats = getStats();
  return res.status(200).json({
    success: true,
    stats
  });
}

