import { Router } from "express";
import {
  listAlerts,
  listDevices,
  listServices,
  readStatus,
  readSummary,
} from "../controllers/securityController.js";

const router = Router();
router.get("/status", readStatus);
router.get("/summary", readSummary);
router.get("/alerts", listAlerts);
router.get("/devices", listDevices);
router.get("/services", listServices);
export default router;
