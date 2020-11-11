import routes from "../routes/router";
import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Boot express
export const app: Application = express();

app.disable("x-powered-by")
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "50MB" }));
app.use("/", routes);

