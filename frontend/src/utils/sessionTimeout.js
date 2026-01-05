let timerId = null

function logout() {
  // hier doe we logout logic:
  // - token verwijderen
  // - user state resetten
  localStorage.removeItem('token')
  window.location.href = '/login'
}

export function startSessionTimeout(getMinutes) {
  stopSessionTimeout()

  const reset = () => {
    stopSessionTimeout()
    const minutes = Number(getMinutes())
    if (!minutes || minutes <= 0) return
    timerId = setTimeout(logout, minutes * 60 * 1000)
  }

  // events die "activiteit" betekenen
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

  const onActivity = () => reset()

  events.forEach((e) => window.addEventListener(e, onActivity))
  reset()

  // return cleanup
  return () => {
    events.forEach((e) => window.removeEventListener(e, onActivity))
    stopSessionTimeout()
  }
}

export function stopSessionTimeout() {
  if (timerId) clearTimeout(timerId)
  timerId = null
}
