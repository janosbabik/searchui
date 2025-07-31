import { useState, useEffect } from 'react'

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js'

export function useTurnstile() {
  const [turnstile, setTurnstile] = useState(null)

  useEffect(() => {
    // If Turnstile is already loaded, do nothing
    if (window.turnstile) {
      setTurnstile(window.turnstile)
      return
    }

    // Define the onload callback
    const onloadCallbackName = 'onTurnstileLoadCallback'
    window[onloadCallbackName] = () => {
      if (window.turnstile) {
        setTurnstile(window.turnstile)
      }
    }

    // Create and append the script
    const script = document.createElement('script')
    script.src = `${TURNSTILE_SCRIPT_URL}?onload=${onloadCallbackName}`
    script.async = true
    script.defer = true
    document.body.append(script)

    // Cleanup function to remove the script and callback
    return () => {
      // It's often better to leave the script loaded,
      // but if you must clean up:
      // document.body.removeChild(script);
      // delete window[onloadCallbackName];
    }
  }, [])

  return turnstile
}
