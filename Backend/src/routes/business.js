import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import Business from '../models/Business.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user.userId });
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile',
  authenticateToken,
  upload.single('logo'),
  async (req, res) => {
    try {
      const { name, address, phone, email } = req.body;
      let business = await Business.findOne({ userId: req.user.userId });

      const updateData = {
        name,
        address,
        phone,
        email,
        ...(req.file && { logo: req.file.path })
      };

      if (business) {
        business = await Business.findByIdAndUpdate(
          business._id,
          updateData,
          { new: true }
        );
      } else {
        business = new Business({
          userId: req.user.userId,
          ...updateData
        });
        await business.save();
      }

      res.json(business);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;