import express from "express";
import { PORT } from "./config/env";
import router from "./routes";
import cors from 'cors';
import { notFoundHandler } from "./controllers/notfound.controller";

const app = express();

// Configure CORS options
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://auctionadda.com'
  ],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

// Public routes
app.use('/v1', router);
// app.use(router);

app.use(notFoundHandler);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;