export function is0xPrefixed(value: string | undefined): value is `0x${string}` {
  return value?.startsWith('0x') ?? false
}
