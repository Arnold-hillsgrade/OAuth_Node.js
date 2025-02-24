import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Business from '../models/Business.js';

const router = express.Router();

router.get('/connect', authenticateToken, (req, res) => {
  const authUrl = `https://login.xero.com/identity/connect/authorize?
    response_type=code&
    client_id=${process.env.XERO_CLIENT_ID}&
    redirect_uri=${encodeURIComponent(process.env.XERO_REDIRECT_URI)}&
    scope=offline_access accounting.transactions`;
  
  res.json({ authUrl });
});

router.get('/callback', authenticateToken, async (req, res) => {
  try {
    const { code } = req.query;
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect with Xero' });
  }
});

export default router;