export interface ResetPasswordEmailProps {
  url: string
  appName: string
}

export interface VerifyEmailEmailProps {
  url: string
  appName: string
  expiresHours: number
}
