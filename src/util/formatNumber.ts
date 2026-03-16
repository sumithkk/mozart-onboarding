function formatNumber(num: number): string {
    let decimalPlaces: number

    if (num < 0.00001) decimalPlaces = 6
    else if (num < 0.0001) decimalPlaces = 5
    else if (num < 0.001) decimalPlaces = 4
    else if (num < 0.01) decimalPlaces = 3
    else decimalPlaces = 2

    const regex = new RegExp(`\\.0{${decimalPlaces}}$`)
    if (num < 1000) return num.toFixed(decimalPlaces).replace(regex, "")

    const absNum = Math.abs(num)

    if (absNum >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + "B"
    } else if (absNum >= 1_000_000) {
        return (num / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M"
    } else {
        return (num / 1_000).toFixed(2).replace(/\.00$/, "") + "K"
    }
}

export default formatNumber
