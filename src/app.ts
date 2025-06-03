import express from "express";
import { PORT } from "./config/env";
import router from "./routes";
import bodyParser from 'body-parser';
import cors from 'cors';
import { notFoundHandler } from "./controllers/notfound.controller";

const app = express();

// Configure CORS options
const corsOptions = {
  origin: [
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies/auth headers
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Public routes
app.use(router);

app.use(notFoundHandler);


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
