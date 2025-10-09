// API pour envoyer les inscriptions vers Google Sheets
export default async function handler(req, res) {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lastName, firstName, email } = req.body;

    if (!lastName || !firstName || !email) {
      return res.status(400).json({ 
        error: 'Tous les champs sont obligatoires',
        success: false 
      });
    }

    // ID de votre Google Sheet
    const SHEET_ID = '1cfJApHpVD1bIbb9IWrePIIO1j0YhjNjBmOLB7S8Mhzk';
    
    // Date actuelle formatée
    const registeredAt = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // URL de l'API Google Sheets (via Google Apps Script)
    // Vous devrez créer un script Google Apps Script pour recevoir les données
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error('GOOGLE_SCRIPT_URL non configurée');
      // Continuer quand même pour ne pas bloquer l'inscription
    } else {
      // Envoyer les données au Google Sheet
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastName,
          firstName,
          email,
          registeredAt
        })
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi vers Google Sheets:', await response.text());
      }
    }

    console.log('Inscription enregistrée:', { lastName, firstName, email, registeredAt });

    return res.status(200).json({
      success: true,
      message: 'Inscription enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur Google Sheets API:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'enregistrement',
      success: false 
    });
  }
}
