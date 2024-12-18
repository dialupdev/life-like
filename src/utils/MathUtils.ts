export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// http://szudzik.com/ElegantPairing.pdf
// https://www.vertexfragment.com/ramblings/cantor-szudzik-pairing-functions
// https://gist.github.com/TheGreatRambler/048f4b38ca561e6566e0e0f6e71b7739
export function szudzikPairSigned(x: number, y: number): number {
  // First, apply a transform to account for negative numbers
  const a = x >= 0 ? x * 2 : x * -2 - 1;
  const b = y >= 0 ? y * 2 : y * -2 - 1;

  // Then perform a Szudzik pairing
  return a < b ? b * b + a : a * a + a + b;
}

export function szudzikUnpairSigned(z: number): [number, number] {
  // First, perform a Szudzik unpairing
  const zSqrt = Math.floor(Math.sqrt(z));
  const zSq = zSqrt * zSqrt;

  const [a, b] = z - zSq < zSqrt ? [z - zSq, zSqrt] : [zSqrt, z - zSq - zSqrt];

  // Then apply a transform to account for negative numbers
  const x = a % 2 === 0 ? a / 2 : (a + 1) / -2;
  const y = b % 2 === 0 ? b / 2 : (b + 1) / -2;

  return [x, y];
}
