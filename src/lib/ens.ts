export async function resolveENS(name: string): Promise<string> {
  try {
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${name}`);
    if (!response.ok) throw new Error('ENS resolution failed');
    const data = await response.json();
    if (data.address) return data.address;
    throw new Error('No address found');
  } catch {
    throw new Error(`Could not resolve ENS name: ${name}`);
  }
}

export function isENS(input: string): boolean {
  return input.trim().toLowerCase().endsWith('.eth');
}

export function isAddress(input: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(input.trim());
}
