import express from 'express';
import cors from 'cors';
import { supabase } from './config/supabase';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('The Server is running');
});

app.get('/test-db', async (_req, res) => {
  const { error } = await supabase
    .from('test_connection')
    .select('*');

  if (error) {
    return res.status(500).json({
      connected: false,
      error: error.message,
    });
  }

  res.json({
    connected: true,
    message: 'Supabase database connection is working',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});