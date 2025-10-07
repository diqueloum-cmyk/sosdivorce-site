// API d'authentification pour les utilisateurs
export default async function handler(req, res) {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'check':
        return await handleCheck(req, res);
      default:
        return res.status(400).json({ error: 'Action non reconnue' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
}

// Gérer l'inscription
async function handleRegister(req, res) {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ 
      error: 'Tous les champs sont obligatoires' 
    });
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Format d\'email invalide' 
    });
  }

  // Validation mot de passe
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Le mot de passe doit contenir au moins 6 caractères' 
    });
  }

  // Simuler l'inscription (en production, vous sauvegarderiez en base de données)
  const user = {
    id: Date.now().toString(),
    firstName,
    lastName,
    email,
    registeredAt: new Date().toISOString()
  };

  // Log pour debug
  console.log('Nouvel utilisateur inscrit:', user);

  // Créer un token de session simple
  const sessionToken = generateSessionToken();
  
  // Définir un cookie de session
  res.setHeader('Set-Cookie', [
    `session_token=${sessionToken}; Path=/; Max-Age=86400; SameSite=Lax`,
    `user_id=${user.id}; Path=/; Max-Age=86400; SameSite=Lax`
  ]);

  return res.status(200).json({
    success: true,
    message: 'Inscription réussie',
    user: {
      id: user.id,
      firstName,
      lastName,
      email
    }
  });
}

// Gérer la connexion
async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email et mot de passe requis' 
    });
  }

  // Simuler la vérification (en production, vous vérifieriez en base de données)
  // Pour l'instant, on accepte tout email/mot de passe valide
  if (!email.includes('@') || password.length < 6) {
    return res.status(401).json({ 
      error: 'Email ou mot de passe incorrect' 
    });
  }

  // Simuler l'utilisateur trouvé
  const user = {
    id: Date.now().toString(),
    firstName: 'Utilisateur',
    lastName: 'Test',
    email,
    registeredAt: new Date().toISOString()
  };

  // Créer un token de session
  const sessionToken = generateSessionToken();
  
  // Définir les cookies de session
  res.setHeader('Set-Cookie', [
    `session_token=${sessionToken}; Path=/; Max-Age=86400; SameSite=Lax`,
    `user_id=${user.id}; Path=/; Max-Age=86400; SameSite=Lax`
  ]);

  console.log('Utilisateur connecté:', user);

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

// Gérer la déconnexion
async function handleLogout(req, res) {
  // Supprimer les cookies de session
  res.setHeader('Set-Cookie', [
    'session_token=; Path=/; Max-Age=0',
    'user_id=; Path=/; Max-Age=0'
  ]);

  return res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
}

// Vérifier le statut de connexion
async function handleCheck(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionToken = cookies.session_token;
  const userId = cookies.user_id;

  if (!sessionToken || !userId) {
    return res.status(200).json({
      success: true,
      authenticated: false
    });
  }

  // Simuler la vérification de session (en production, vous vérifieriez en base)
  // Pour l'instant, on considère que la session est valide si les cookies existent
  
  return res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: userId,
      firstName: 'Utilisateur',
      lastName: 'Connecté',
      email: 'user@example.com'
    }
  });
}

// Générer un token de session simple
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Parser les cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
}
