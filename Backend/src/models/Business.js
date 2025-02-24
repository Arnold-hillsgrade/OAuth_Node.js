import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  logo: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  xeroIntegrated: {
    type: Boolean,
    default: false
  },
  xeroTokens: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  }
});

export default mongoose.model('Business', businessSchema);