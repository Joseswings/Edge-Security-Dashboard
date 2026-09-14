import { getAlerts } from "../services/alertService.js";
import { getDevices } from "../services/deviceService.js";
import { getServices } from "../services/serviceHealthService.js";
import { getStatus } from "../services/statusService.js";
import { getSummary } from "../services/summaryService.js";

export const listAlerts = (_req, res) => res.json(getAlerts());
export const listDevices = (_req, res) => res.json(getDevices());
export const listServices = (_req, res) => res.json(getServices());
export const readStatus = (_req, res) => res.json(getStatus());
export const readSummary = (_req, res) => res.json(getSummary());
