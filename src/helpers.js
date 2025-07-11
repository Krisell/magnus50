export function generateRandomId() {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Crypto API is not available in this environment.');
  }
  
  const randomBytes = crypto.getRandomValues(new Uint8Array(20));
  
  return Array.from(randomBytes, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}
