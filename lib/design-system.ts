export const tokens = {
  colors: {
    gold: '#C9973A',
    goldLight: '#E5B85C',
    goldPale: '#FAF0D7',
    sand: '#F5EFE0',
    sandDark: '#E8DFC8',
    obsidian: '#0F0F0E',
    charcoal: '#1C1C1A',
    slate: '#2E2E2B',
    ink: '#3D3D38',
    mist: '#8A8A80',
    fog: '#B8B8B0',
    white: '#FDFCF8',
    success: '#3A8A5A',
    successPale: '#EAF5EE',
    danger: '#C93A3A',
    dangerPale: '#FDEAEA',
    warning: '#C97A1A',
    warningPale: '#FFF3E0',
    info: '#2A6A9A',
    infoPale: '#E8F2FA',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 4px rgba(15,15,14,0.06)',
    md: '0 4px 24px rgba(15,15,14,0.08)',
    lg: '0 12px 48px rgba(15,15,14,0.14)',
    gold: '0 4px 14px rgba(201,151,58,0.35)',
    goldHover: '0 6px 20px rgba(201,151,58,0.45)',
  },
  spacing: {
    sectionY: '96px',
    cardPadding: '28px',
    inputPadding: '10px 14px',
    gap: '16px',
  },
}

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ')
