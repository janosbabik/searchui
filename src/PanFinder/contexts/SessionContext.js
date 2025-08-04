import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'

const SessionContext = createContext({
  sessionId: null,
  sessionCreating: false,
  setSessionId: () => {
    /* default no-op */
  },
  createSession: () => Promise.resolve(),
  invalidateSession: () => {
    /* default no-op */
  },
  getSessionId: () => null,
})

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null)
  const [sessionCreating, setSessionCreating] = useState(false)
  const sessionIdRef = useRef(sessionId)

  // Keep ref in sync with state
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  const createSession = useCallback(
    async (createSessionFn, token) => {
      if (token && !sessionId && !sessionCreating) {
        setSessionCreating(true)

        try {
          const response = await createSessionFn(token)
          setSessionId(response.session_id)
          return response
        } finally {
          setSessionCreating(false)
        }
      }
    },
    [sessionId, sessionCreating],
  )

  const invalidateSession = useCallback(() => {
    setSessionId(null)
    sessionIdRef.current = null
  }, [])

  const getSessionId = useCallback(() => {
    return sessionIdRef.current
  }, [])

  const contextValue = {
    sessionId,
    sessionCreating,
    setSessionId,
    createSession,
    invalidateSession,
    getSessionId,
  }

  return React.createElement(
    SessionContext.Provider,
    { value: contextValue },
    children,
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
