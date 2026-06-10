import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import meRouter from "./routes/me.route"
import productRouter from "./routes/product.route"
import streamRouter from "./routes/stream.route"
import checkoutRouter from "./routes/checkout.route"

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { polarWebhookHandler } from "./webhooks/polar";

import { getEnv } from "./lib/env";
import job from "./lib/cron";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/webhooks/clerk", rawJson, (req, res) => {
    void clerkWebhookHandler(req, res);
});

app.post("/webhooks/polar", rawJson, (req, res) => {
    void polarWebhookHandler(req, res);
} );

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
})

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);



const publicDir = path.join(process.cwd(), "public")
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
            next();
            return;
        }

        if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
            next();
            return;
        }

        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });
}

// todo: add error handler middleware


app.listen(env.PORT, () => {
    console.log("listening on port: ", env.PORT)
    if (env.NODE_ENV === "production") {
        job.start();
    }
});