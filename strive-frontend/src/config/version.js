// Single source of truth for the app version: the "version" field in package.json.
// Bump it with `npm version patch|minor|major` from strive-frontend.
import { version } from '../../package.json'

export const APP_VERSION = version
