import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Workspace from '../models/Workspace.js';
import axios from 'axios';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const url = "https://app.isoplus.online/api/v2/workspaces";
    
    const params = {
      "limit": "10",
      "sort_by": "created_at",
      "sort_direction": "desc",
    };

    const headers = {
      "Authorization": `Bearer ${req.header.token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    const response = await axios.get(url, { headers, params });
    console.log(response)
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, businessId } = req.body;
    const workspace = new Workspace({
      name,
      businessId,
      userId: req.user.userId
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;