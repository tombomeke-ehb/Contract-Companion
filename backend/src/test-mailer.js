import dotenv from 'dotenv'
dotenv.config({ path: new URL('../.env', import.meta.url) })

import { sendTestEmail } from '../src/services/notification.service.js'

const to = process.argv[2]
if (!to) {
  console.error('Usage: node test-mailer.js <email>')
  process.exit(1)
}

sendTestEmail(to)
  .then(() => {
    console.log('Testmail verzonden naar', to)
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fout bij verzenden testmail:', err)
    process.exit(2)
  })
