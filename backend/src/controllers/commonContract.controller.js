// backend/src/controllers/commonContract.controller.js
import { getCommonContractReport } from '../services/commonContract.service.js';

export async function getCommonContractReportHandler(req, res) {
  const contractKey = req.params.contractKey;
  try {
    const report = await getCommonContractReport(contractKey);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch report' });
  }
}
