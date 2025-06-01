import express from "express";
import { PORT } from "./config/env";
import router from "./routes";
import bodyParser from 'body-parser';

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Public routes
app.use(router);


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
