export function isLiteralable(val: any): val is literalable {
    return val === null || (typeof val === 'boolean' || typeof val === 'string' || typeof val === 'number');
}
