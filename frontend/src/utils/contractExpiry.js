// Utility to check for expiring contracts and send notifications

/**
 * Check if a contract is expiring tomorrow
 * @param {string} endDateString - ISO datetime string
 * @returns {boolean}
 */
export function isExpiringTomorrow(endDateString) {
  if (!endDateString) return false
  
  const endDate = new Date(endDateString)
  if (isNaN(endDate.getTime())) return false
  
  // Get tomorrow's date at midnight
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
  
  // Check if end date falls on tomorrow
  const endDateOnly = new Date(endDate)
  endDateOnly.setHours(0, 0, 0, 0)
  
  return endDateOnly.getTime() === tomorrow.getTime()
}

/**
 * Check all contracts and return those expiring tomorrow
 * @returns {Array} List of contracts expiring tomorrow
 */
export function getExpiringContracts() {
  const allContracts = JSON.parse(localStorage.getItem('all_contract_dates') || '[]')
  
  return allContracts.filter(contract => {
    return contract.endDate && isExpiringTomorrow(contract.endDate)
  })
}

/**
 * Check for expiring contracts and show notifications
 * @param {Function} notificationPush - The notification store push function
 * @param {Function} setCountFunction - The function to set expiring contract count
 */
export function checkAndNotifyExpiringContracts(notificationPush, setCountFunction) {
  const expiringContracts = getExpiringContracts()
  
  // Set the count in the store for the badge
  if (setCountFunction) {
    setCountFunction(expiringContracts.length)
  }
  
  expiringContracts.forEach(contract => {
    notificationPush({
      title: '⚠️ Contract Expiring Tomorrow',
      message: `"${contract.title}" expires tomorrow. Please review or renew.`,
      variant: 'warning',
      timeout: 10000, // Show for 10 seconds
      isContractExpiry: true,
      route: { name: 'report-detail', params: { id: contract.contractId || '1' } },
      contractId: contract.contractId
    })
  })
  
  return expiringContracts
}

