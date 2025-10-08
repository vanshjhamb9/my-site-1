import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from './_utils/auth.js';
import { getStorage } from './_utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path from URL - Vercel passes the full path
  const urlParts = req.url?.split('?')[0].split('/api/admin') || ['', ''];
  const path = urlParts[1] || '/';
  
  // Admin login (no auth required)
  if ((path === '/login' || path === '') && req.method === 'POST' && req.body?.password !== undefined) {
    try {
      const { password } = req.body;
      const envAdminPassword = process.env.ADMIN_PASSWORD;
      
      if (!envAdminPassword || password !== envAdminPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
      return res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  // Check authentication
  if (path === '/check' && req.method === 'POST') {
    return adminAuth(req, res, () => {
      return res.status(200).json({ authenticated: true });
    });
  }

  // All other routes require authentication
  return adminAuth(req, res, async () => {
    const storage = getStorage();

    try {
      // Get all leads
      if (path === '/leads' && req.method === 'GET') {
        const leads = await storage.getAllLeads();
        return res.status(200).json(leads);
      }

      // Lead by ID operations
      const leadIdMatch = path.match(/^\/leads\/([^\/]+)$/);
      if (leadIdMatch) {
        const id = leadIdMatch[1];

        if (req.method === 'GET') {
          const lead = await storage.getLead(id);
          if (!lead) return res.status(404).json({ error: 'Lead not found' });
          return res.status(200).json(lead);
        }

        if (req.method === 'DELETE') {
          const success = await storage.deleteLead(id);
          if (!success) return res.status(404).json({ error: 'Lead not found' });
          return res.status(200).json({ message: 'Lead deleted successfully' });
        }
      }

      // Update lead status
      const statusMatch = path.match(/^\/leads\/([^\/]+)\/status$/);
      if (statusMatch && req.method === 'PATCH') {
        const id = statusMatch[1];
        const { status } = req.body;
        
        if (!status) return res.status(400).json({ error: 'Status is required' });
        
        const lead = await storage.updateLeadStatus(id, status);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        return res.status(200).json(lead);
      }

      return res.status(404).json({ error: 'Not found' });
    } catch (error: any) {
      console.error('Admin API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
