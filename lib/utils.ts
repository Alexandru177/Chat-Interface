import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * `HashSaltPass` is an asynchronous function that hashes a password using the SHA-256 algorithm.
 * It also salts the password to add an extra layer of security.
 *
 * @param {string} password - The password to be hashed.
 * @param {string} [salt] - An optional salt to be used for hashing. If not provided, a new salt is generated.
 *
 * @returns {Promise<{hashedPassword: string, salt: string}>} - A Promise that resolves to an object containing the hashed password and the salt used.
 *
 * @example
 * // When creating a new user
 * const { hashedPassword, salt } = await hashPass('myPassword');
 *
 * // When checking a user's password
 * const { hashedPassword } = await hashPass('myPassword', 'existingSalt');
 *
 * @throws Will throw an error if the hashing operation fails.
 */
export async function HashSaltPass(password: string, salt?: string) {
  // Generate a new salt if one wasn't provided
  if (!salt) {
    salt = crypto.randomUUID()
  }

  const encoder = new TextEncoder()
  const saltedPassword = encoder.encode(password + salt)
  const hashedPasswordBuffer = await crypto.subtle.digest(
    'SHA-256',
    saltedPassword
  )

  const hashedPassword = Array.from(new Uint8Array(hashedPasswordBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return { hashedPassword, salt }
}

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return 'Invalid credentials!'
    case ResultCode.InvalidSubmission:
      return 'Invalid submission, please try again!'
    case ResultCode.UserAlreadyExists:
      return 'User already exists, please log in!'
    case ResultCode.UserCreated:
      return 'User created, welcome!'
    case ResultCode.UnknownError:
      return 'Something went wrong, please try again!'
    case ResultCode.UserLoggedIn:
      return 'Logged in!'
  }
}
