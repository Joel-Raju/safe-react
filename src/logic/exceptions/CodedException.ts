import * as Sentry from '@sentry/react'
import registry from './registry'
import { IS_PRODUCTION } from 'src/utils/constants'

export class CodedException extends Error {
  public code: number
  public uiMessage: string | undefined

  constructor(code: keyof typeof registry, customMessage?: string) {
    super()

    const content = registry[code]
    if (!content) {
      throw new CodedException(0, `${code}`)
    }

    const extraInfo = customMessage ? ` (${customMessage})` : ''
    this.message = `${code}: ${content.description}${extraInfo}`
    this.code = code
    this.uiMessage = content.uiMessage
  }

  public log(): void {
    if (IS_PRODUCTION) {
      Sentry.captureException(this)
      console.error(this.message) // log only the message w/o the trace
    } else {
      console.error(this) // log the full error on dev
    }
  }
}

export function logError(code: keyof typeof registry, customMessage?: string): CodedException {
  const error = new CodedException(code, customMessage)
  error.log()
  return error
}
