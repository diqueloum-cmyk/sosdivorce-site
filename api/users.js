// API pour gérer les utilisateurs avec Vercel KV (base de données)
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
      case 'list':
        return await handleList(req, res);
      default:
        return res.status(400).json({ error: 'Action non reconnue' });
    }
  } catch (error) {
    console.error('Users API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
}

// Gérer l'inscription
async function handleRegister(req, res) {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ 
      error: 'Tous les champs sont obligatoires' 
    });
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Format d\'email invalide' 
    });
  }

  // Stocker l'utilisateur (simulation avec localStorage côté client)
  // En production, vous utiliseriez une vraie base de données
  const user = {
    id: Date.now().toString(),
    firstName,
    lastName,
    email,
    registeredAt: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };

  // Pour l'instant, on retourne juste un succès
  // En production, vous sauvegarderiez en base de données
  console.log('Nouvel utilisateur inscrit:', user);

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

// Lister les utilisateurs (pour l'admin)
async function handleList(req, res) {
  // En production, vous récupéreriez depuis la base de données
  // Pour l'instant, on retourne une liste vide
  return res.status(200).json({
    success: true,
    users: [],
    message: 'Fonctionnalité en développement'
  });
}
