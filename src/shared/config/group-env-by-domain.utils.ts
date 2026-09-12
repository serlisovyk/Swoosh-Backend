export function groupEnvByDomain(config: Record<string, unknown>) {
  return {
    app: {
      NODE_ENV: config.NODE_ENV,
      APP_NAME: config.APP_NAME,
      CLIENT_URL: config.CLIENT_URL,
      SERVER_URL: config.SERVER_URL,
      PORT: config.PORT,
    },
    cors: {
      CORS_DOMAINS: config.CORS_DOMAINS,
      COOKIE_DOMAIN: config.COOKIE_DOMAIN,
    },
    jwt: {
      JWT_SECRET: config.JWT_SECRET,
      JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
      RESET_TOKEN_SECRET: config.RESET_TOKEN_SECRET,
      AUTH_DUMMY_PASSWORD_HASH: config.AUTH_DUMMY_PASSWORD_HASH,
      JWT_ACCESS_TOKEN_EXPIRES_IN: config.JWT_ACCESS_TOKEN_EXPIRES_IN,
      JWT_REFRESH_TOKEN_EXPIRES_IN: config.JWT_REFRESH_TOKEN_EXPIRES_IN,
    },
    captcha: {
      CLOUDFLARE_TURNSTILE_SECRET_KEY: config.CLOUDFLARE_TURNSTILE_SECRET_KEY,
    },
    swagger: {
      SWAGGER_ENABLED: config.SWAGGER_ENABLED,
      SWAGGER_USER: config.SWAGGER_USER,
      SWAGGER_PASSWORD: config.SWAGGER_PASSWORD,
    },
    mongo: {
      MONGO_URI: config.MONGO_URI,
    },
    email: {
      RESEND_API_KEY: config.RESEND_API_KEY,
      EMAIL_SENDER: config.EMAIL_SENDER,
    },
    throttler: {
      THROTTLE_TTL: config.THROTTLE_TTL,
      THROTTLE_LIMIT: config.THROTTLE_LIMIT,
    },
  }
}
