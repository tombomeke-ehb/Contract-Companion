// backend/src/routes/commonContract.routes.js
import express from 'express';
import { getCommonContractReportHandler } from '../controllers/commonContract.controller.js';
const router = express.Router();

// GET /api/common-contracts/:contractKey/report
router.get('/:contractKey/report', getCommonContractReportHandler);

export default router;
