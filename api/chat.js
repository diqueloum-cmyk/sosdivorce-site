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
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Lire les cookies
    const cookies = parseCookies(req.headers.cookie || '');
    const qUsed = parseInt(cookies.q_used || '0');
    const registered = cookies.registered === '1';

    console.log('Cookies:', { qUsed, registered });

    // Vérifier si l'utilisateur a dépassé la limite
    if (!registered && qUsed >= 2) {
      return res.status(200).json({
        status: 'need_signup',
        message: 'Vous avez utilisé vos 2 questions gratuites. Inscrivez-vous pour continuer.',
        qUsed,
        remaining: 0
      });
    }

    // Vérifier que la clé API est présente
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Configuration manquante. Veuillez contacter l\'administrateur.' 
      });
    }

    console.log('Using OpenAI API key:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

    // Appeler l'API OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant juridique spécialisé en droit du divorce français. Réponds de manière claire, précise et professionnelle. Donne des conseils juridiques généraux mais recommande toujours de consulter un avocat pour des cas spécifiques.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API Error:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la génération de la réponse. Veuillez réessayer.' 
      });
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';

    // Incrémenter le compteur de questions si non inscrit
    const newQUsed = registered ? qUsed : qUsed + 1;
    const remaining = registered ? 'illimité' : Math.max(0, 2 - newQUsed);

    // Définir les cookies
    if (!registered) {
      res.setHeader('Set-Cookie', [
        `q_used=${newQUsed}; Max-Age=${24 * 60 * 60}; Path=/; SameSite=Lax`
      ]);
    }

    return res.status(200).json({
      status: 'ok',
      answer,
      qUsed: newQUsed,
      remaining
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
}

// Fonction utilitaire pour parser les cookies
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

