export const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
}

export type NODE_ENV = (typeof NODE_ENV)[keyof typeof NODE_ENV]
