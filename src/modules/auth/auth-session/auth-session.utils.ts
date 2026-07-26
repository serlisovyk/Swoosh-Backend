import {
  AUTH_SESSION_UNKNOWN_DEVICE_LABEL,
  AUTH_SESSION_WINDOWS_LABEL,
  AUTH_SESSION_MACOS_LABEL,
  AUTH_SESSION_IOS_LABEL,
  AUTH_SESSION_ANDROID_LABEL,
  AUTH_SESSION_LINUX_LABEL,
  AUTH_SESSION_EDGE_LABEL,
  AUTH_SESSION_OPERA_LABEL,
  AUTH_SESSION_CHROME_LABEL,
  AUTH_SESSION_FIREFOX_LABEL,
  AUTH_SESSION_SAFARI_LABEL,
} from '../auth.constants'

export function getAuthSessionDeviceLabel(userAgent: string | null) {
  if (!userAgent) return AUTH_SESSION_UNKNOWN_DEVICE_LABEL

  const browser = getBrowserLabel(userAgent)
  const operatingSystem = getOperatingSystemLabel(userAgent)

  if (browser && operatingSystem) {
    return `${browser}, ${operatingSystem}`
  }

  return browser ?? operatingSystem ?? AUTH_SESSION_UNKNOWN_DEVICE_LABEL
}

function getBrowserLabel(userAgent: string) {
  if (userAgent.includes('Edg/')) return AUTH_SESSION_EDGE_LABEL
  if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    return AUTH_SESSION_OPERA_LABEL
  }
  if (userAgent.includes('Chrome/')) return AUTH_SESSION_CHROME_LABEL
  if (userAgent.includes('Firefox/')) return AUTH_SESSION_FIREFOX_LABEL
  if (userAgent.includes('Safari/')) return AUTH_SESSION_SAFARI_LABEL

  return null
}

function getOperatingSystemLabel(userAgent: string) {
  if (userAgent.includes('Windows')) return AUTH_SESSION_WINDOWS_LABEL
  if (
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad') ||
    userAgent.includes('iPod')
  ) {
    return AUTH_SESSION_IOS_LABEL
  }
  if (userAgent.includes('Android')) return AUTH_SESSION_ANDROID_LABEL
  if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
    return AUTH_SESSION_MACOS_LABEL
  }
  if (userAgent.includes('Linux')) return AUTH_SESSION_LINUX_LABEL

  return null
}
