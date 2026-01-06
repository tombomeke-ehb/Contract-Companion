let timerId = null
let listeners = []
// Default logout function - removes token and redirects to login
function defaultLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

/**
 * Starts the session timeout with activity monitoring
 * @param {number|function} minutesOrGetter - Either a number of minutes or a function that returns minutes
 * @param {function} onLogout - Optional custom logout handler
 * @returns {function} Cleanup function to stop monitoring
 */
export function startSessionTimeout(minutesOrGetter, onLogout = null) {
  stopSessionTimeout()

  const logoutHandler = onLogout || defaultLogout
  
  // Convert input to function that returns minutes
  const getMinutes = typeof minutesOrGetter === 'function' 
    ? minutesOrGetter 
    : () => Number(minutesOrGetter)

  const reset = () => {
    stopSessionTimeout()
    const minutes = getMinutes()
    if (!minutes || minutes <= 0) return
    timerId = setTimeout(() => {
      logoutHandler()
    }, minutes * 60 * 1000)
  }

  // Events that indicate user activity
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

  const onActivity = () => reset()

  events.forEach((e) => {
    window.addEventListener(e, onActivity)
    listeners.push({ event: e, handler: onActivity })
  })

  reset()

  // Return cleanup function
  return () => {
    stopSessionTimeout()
    listeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler)
    })
    listeners = []
  }
}

export function stopSessionTimeout() {
  if (timerId) clearTimeout(timerId)
  timerId = null
}


export function updateSessionTimeoutMinutes(minutes) {
  // Just update the value - next activity will reset with new timeout
  // Or if you want to immediately apply: stopSessionTimeout() then call startSessionTimeout again
}
