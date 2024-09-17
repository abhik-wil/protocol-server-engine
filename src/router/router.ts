import express from "express";
import { Request, Response } from "express";

export const router = express.Router();
import {
  becknToBusiness,
  businessToBecknWrapper,
  updateSession,
} from "../controller/index";
const logger = require("../utils/logger");

// buss > beckn
router.post("/createPayload", businessToBecknWrapper);

// bkn > buss
router.post("/ondc/:method", becknToBusiness);

router.post("/updateSession", updateSession);

router.get("/health", (req: Request, res: Response) => {
  logger.info("Recieved request");
  res.send({ status: "working" });
});
