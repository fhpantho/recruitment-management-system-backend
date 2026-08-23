import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.middleware.js';
import { requirePermission } from './middleware/permission.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get(
  '/api/test/candidate-view',
  authenticate,
  requirePermission('candidate.view'),
  (_req, res) => {
    res.json({
      success: true,
      message: 'You have candidate.view permission',
    });
  }
);

app.get('/', (_req, res) => {
  res.send('The Server is running');
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});