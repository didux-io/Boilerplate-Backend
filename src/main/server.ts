import routes from "../routes/indexVersion";
import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Boot express
export const app: Application = express();

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "50MB" }));
app.use("/", routes);

