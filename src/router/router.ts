import express from "express";
import { Request, Response } from "express";

export const router = express.Router();
import {
  becknToBusiness,
  businessToBecknWrapper,
  updateSession,
  getsession,
} from "../controller/index";
const logger = require("../utils/logger").init();

// buss > beckn
router.post("/createPayload", businessToBecknWrapper);

// bkn > buss
router.post("/ondc/:method", becknToBusiness);

router.post("/updateSession", updateSession);

router.get("/health", (req: Request, res: Response) => {
  logger.info("/health api controller");
  res.send({ status: "working" });
  logger.info("/health api executed");
});

router.get("/session", getsession);
