export default async function handler(req, res) {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email } = req.body;

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

    // Définir les cookies d'inscription
    const oneYear = 365 * 24 * 60 * 60; // 1 an en secondes
    
    res.setHeader('Set-Cookie', [
      `registered=1; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
      `q_used=0; Max-Age=${oneYear}; Path=/; SameSite=Lax`,
      `user_name=${encodeURIComponent(firstName)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`
    ]);

    // Log pour debug (en production, vous pourriez sauvegarder en base de données)
    console.log('Nouvelle inscription:', { firstName, lastName, email, timestamp: new Date().toISOString() });

    return res.status(200).json({
      ok: true,
      message: 'Inscription réussie ! Vous pouvez maintenant poser des questions illimitées.',
      user: {
        firstName,
        lastName,
        email
      }
    });

  } catch (error) {
    console.error('Signup API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      ok: false 
    });
  }
}
