import { GoFetch } from './GoFetch';

declare global {
  namespace Deno {
    function cwd(): string;
  }
  namespace process {
    function cwd(): string;
  }
}

let baseURL: string;
if (globalThis.location) {
  baseURL = globalThis.location.origin;
} else if (globalThis.process) {
  baseURL = globalThis.process.cwd();
} else if (globalThis.Deno) {
  baseURL = globalThis.Deno.cwd();
} else {
  throw new Error('No Base URL');
}

export default new GoFetch(baseURL);

// on platforms where baseURL is impossible to assume i.e. deno or node
// we export the constructor instead
export * from './common/types';
export * from './common/utils';
export { RetryController } from './RetryController';
export { GoFetch };