import express from "express";
import { websitesRouter } from "./routes/websites";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use("/api/v1/websites",websitesRouter);

app.listen(3000,() => {
    console.log("Listening on port 3000");
})