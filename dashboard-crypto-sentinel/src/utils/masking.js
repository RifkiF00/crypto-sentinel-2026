/**
 * Privacy & PII Masking Utilities
 * Compliance with UU PDP No. 27/2022 and POJK Anti-Fraud Data Privacy Standards
 */

export function maskName(name, isMasked = true) {
    if (!isMasked || !name) return name;
    const parts = String(name).trim().split(' ');
    return parts.map(p => {
        if (p.length <= 2) return p.charAt(0) + '*';
        if (p.length <= 4) return p.slice(0, 2) + '**';
        return p.slice(0, 2) + '*'.repeat(p.length - 3) + p.slice(-1);
    }).join(' ');
}

export function maskAccount(acc, isMasked = true) {
    if (!isMasked || !acc) return acc;
    const s = String(acc);
    if (s.length <= 4) return '****' + s;
    if (s.length <= 8) return s.slice(0, 3) + '****' + s.slice(-2);
    return s.slice(0, 4) + '****' + s.slice(-3);
}

export function maskNik(nik, isMasked = true) {
    if (!isMasked || !nik) return nik;
    const s = String(nik);
    if (s.length <= 6) return '******' + s.slice(-2);
    return s.slice(0, 6) + '******' + s.slice(-4);
}

export function maskIp(ip, isMasked = true) {
    if (!isMasked || !ip) return ip;
    const parts = String(ip).split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.*.*`;
    }
    return String(ip).slice(0, 6) + '****';
}

export function maskDevice(dev, isMasked = true) {
    if (!isMasked || !dev) return dev;
    const s = String(dev);
    if (s.length <= 8) return s.slice(0, 3) + '****';
    return s.slice(0, 6) + '****' + s.slice(-3);
}
