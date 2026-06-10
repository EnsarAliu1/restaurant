import { Router } from "express";
import { createCheckout } from "../controllers/checkout.controller";

const router = Router();

router.post("/", createCheckout);

export default router;