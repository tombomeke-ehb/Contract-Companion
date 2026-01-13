// Simple background worker for contract analysis
import dotenv from 'dotenv'
dotenv.config({ path: new URL('../../.env', import.meta.url) })

import { getPendingContracts, runAnalysisForContract, markContractDone, saveAnalysisResult, updateDocumentTitleAndType } from '../services/contract.service.js'
import { sendNotification, sendEmail } from '../services/notification.service.js'
import { connect } from '../config/db.js'
import app from '../app.js';

async function processPendingContracts() {
  try {
    const pending = await getPendingContracts()
    for (const contract of pending) {
      try {
        const result = await runAnalysisForContract(contract)
        if (result.analysisJson?.title || result.analysisJson?.contractType) {
          await updateDocumentTitleAndType(
            contract.ID_DOC || contract.id,
            result.analysisJson.title || contract.TITEL || contract.title,
            result.analysisJson.contractType || contract.DOC_TYPE || contract.docType
          )
        }
        await saveAnalysisResult(contract.ID_DOC || contract.id, result)
        await markContractDone(contract.ID_DOC || contract.id)
        await sendNotification(contract.ID_USER, {
          title: 'Analyse voltooid',
          message: `Je contract "${contract.TITEL || contract.title}" is geanalyseerd. Bekijk het rapport!`,
          contractId: contract.ID_DOC || contract.id,
          variant: result.riskScore >= 7 ? 'danger' : 'info'
        })
        await sendEmail(contract.USER_EMAIL, {
          subject: 'Contract analyse voltooid',
          body: `Je contract "${contract.TITEL || contract.title}" is geanalyseerd. Bekijk het rapport in Contract Companion.`
        })
        if (typeof app.broadcastContractAnalyzed === 'function') {
          app.broadcastContractAnalyzed(contract.ID_DOC || contract.id);
        }
        try {
          const https = await import('https');
          const agent = new https.Agent({ rejectUnauthorized: false });
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // <--- voeg deze regel toe
          await fetch('https://localhost:3443/api/contracts/notify-analyzed', {
            method: 'POST',
            body: JSON.stringify({ contractId: contract.ID_DOC || contract.id }),
            headers: { 'Content-Type': 'application/json' },
            agent
          });
        } catch (e) {}
      } catch (err) {}
    }
  } catch (err) {}
}

connect().then(() => {
  setInterval(processPendingContracts, 60 * 1000)
})
