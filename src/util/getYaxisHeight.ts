export function getYAxisHeight(max: number): number {
    if (max === 0) return 1

    const exponent = Math.floor(Math.log10(max))
    const magnitude = Math.pow(10, exponent)
    const divisor = magnitude

    return Math.ceil(max / divisor) * divisor
}
