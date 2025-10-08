import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    
    if (!envAdminPassword || password !== envAdminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
}
