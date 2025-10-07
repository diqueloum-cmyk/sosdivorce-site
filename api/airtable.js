// API pour stocker les utilisateurs dans Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Utilisateurs';

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
    const { action, firstName, lastName, email } = req.body;

    if (action === 'register') {
      return await registerUser(firstName, lastName, email, res);
    } else if (action === 'list') {
      return await listUsers(res);
    } else {
      return res.status(400).json({ error: 'Action non reconnue' });
    }
  } catch (error) {
    console.error('Airtable API Error:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
}

async function registerUser(firstName, lastName, email, res) {
  if (!firstName || !lastName || !email) {
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

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log('Airtable non configuré, simulation d\'inscription');
    return res.status(200).json({
      success: true,
      message: 'Inscription simulée (Airtable non configuré)',
      user: { firstName, lastName, email }
    });
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Prénom': firstName,
          'Nom': lastName,
          'Email': email,
          'Date d\'inscription': new Date().toISOString(),
          'Source': 'sosdivorce.fr'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Airtable API Error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: data.id,
        firstName,
        lastName,
        email
      }
    });

  } catch (error) {
    console.error('Erreur Airtable:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'inscription' 
    });
  }
}

async function listUsers(res) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(200).json({
      success: true,
      users: [],
      message: 'Airtable non configuré'
    });
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=100`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API Error: ${response.status}`);
    }

    const data = await response.json();
    const users = data.records.map(record => ({
      id: record.id,
      firstName: record.fields['Prénom'],
      lastName: record.fields['Nom'],
      email: record.fields['Email'],
      registeredAt: record.fields['Date d\'inscription'],
      source: record.fields['Source']
    }));

    return res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Erreur Airtable:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des utilisateurs' 
    });
  }
}
