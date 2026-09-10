import contact from '../src/config/contact.json' with { type: 'json' };

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json(contact);
  if (req.method === 'POST') return res.status(503).json({ sent: false, error: 'Las consultas en línea aún no están disponibles. No se ha enviado ni guardado tu información.' });
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método no permitido.' });
}
