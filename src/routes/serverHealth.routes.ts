import { Router } from "express";
import { healthcheck } from "../utils/serverHealthcheck";
import type { RequestHandler } from "express";

const router = Router();

const healthCheckHandler: RequestHandler = async (req, res, next) => {
  await healthcheck(req, res);
};

router.get("/", healthCheckHandler);

export default router;
