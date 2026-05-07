// Shim for node:module used by @better-auth/expo
// createRequire is not available in React Native, so we provide a mock
export function createRequire() {
  return function require() {
    throw new Error("require is not available in React Native");
  };
}
