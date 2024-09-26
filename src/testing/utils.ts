export const API_TIMEOUT = 1000
export const TTL_TIMEOUT = 10000

export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const apiTimeout = () => timeout(API_TIMEOUT)
export const advanceApiTimeout = () => jest.advanceTimersByTimeAsync(API_TIMEOUT)
export const advanceHalfApiTimeout = () => jest.advanceTimersByTimeAsync(API_TIMEOUT / 2)
export const advanceTtlTimeout = () => jest.advanceTimersByTimeAsync(TTL_TIMEOUT)
