import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import notificationRoutes from './routes/notification.routes';
import { Log } from '../../logging_middleware/src/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware for all hits
app.use((req, res, next) => {
  Log('backend', 'info', 'route', `${req.method} ${req.url} hit`);
  next();
});

app.use('/api/notifications', notificationRoutes);

app.listen(PORT, async () => {
  await Log('backend', 'info', 'service', `Server started on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
