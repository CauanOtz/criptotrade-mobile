import React, { useState, useMemo } from 'react';
import { Image, ImageProps } from 'react-native';
import { marketApi } from '@/lib/apiClient';

const QUOTE_SUFFIXES = [
  'USDT',
  'USDC',
  'BUSD',
  'TUSD',
  'USDP',
  'DAI',
  'BTC',
  'ETH',
  'BNB',
  'BRL',
  'EUR',
  'USD',
  'TRY',
  'BIDR',
  'AUD',
  'GBP',
  'ARS',
  'MXN',
  'NGN',
  'ZAR',
  'IDR',
  'JPY',
];

const ICON_OVERRIDES: Record<string, string> = {
  IOTA: 'miota',
  MIOTA: 'iota',
  BNB: 'bnb',
  BCH: 'bch',
  DOGE: 'doge',
  SHIB: 'shib',
  XRP: 'xrp',
  SOL: 'sol',
  ADA: 'ada',
  AVAX: 'avax',
  DOT: 'dot',
  LTC: 'ltc',
  MATIC: 'matic',
  APT: 'apt',
  ARB: 'arb',
  PEPE: 'pepe',
  FLOKI: 'floki',
  OP: 'op',
  SUI: 'sui',
  SEI: 'sei',
  FIL: 'fil',
  ETC: 'etc',
  IMX: 'imx',
  '1INCH': '1inch',
};

const sanitizeSymbol = (value?: string) => {
  if (!value) return '';
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '';
  const suffix = QUOTE_SUFFIXES.find(s => cleaned.length > s.length && cleaned.endsWith(s));
  return suffix ? cleaned.slice(0, -suffix.length) : cleaned;
};

const buildCoincapKey = (symbol: string) => {
  if (!symbol) return '';
  return ICON_OVERRIDES[symbol] ?? symbol.toLowerCase();
};

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  symbol?: string;
  pair?: string;
  name?: string;
  image?: string | null;
  curated?: string | null;
  size?: number;
}

export default function FallbackImage({
  symbol,
  pair,
  name,
  image,
  curated,
  size = 64,
  style,
  ...rest
}: FallbackImageProps) {
  const baseSymbol = sanitizeSymbol(symbol) || sanitizeSymbol(pair) || sanitizeSymbol(name);
  const resolvedSymbol = baseSymbol || (symbol?.toUpperCase?.() ?? symbol ?? '');

  const candidates = useMemo(() => {
    const list: string[] = [];
    const key = buildCoincapKey(resolvedSymbol);

    if (image) list.push(image);
    if (curated) list.push(curated);
    if (key) {
      list.push(`https://assets.coincap.io/assets/icons/${key}@2x.png`);
      list.push(`https://cryptoicons.org/api/icon/${key}/64`);
      list.push(`https://cryptoicons.org/api/icon/${key}/128`);
      list.push(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${key}.png`);
      list.push(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/white/${key}.png`);
      const binSymbol = resolvedSymbol || key.toUpperCase();
      if (binSymbol) {
        list.push(marketApi.getCryptoIcon(binSymbol));
      }
    } else if (resolvedSymbol) {
      list.push(marketApi.getCryptoIcon(resolvedSymbol));
    }

    list.push(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedSymbol || symbol || name || '??')}` +
        `&background=0f172a&color=f8fafc&size=${Math.max(64, size)}`
    );

    return Array.from(new Set(list.filter(Boolean)));
  }, [resolvedSymbol, curated, image, size, symbol, name, pair]);

  const [index, setIndex] = useState(0);

  const uri = candidates[index];

  const handleError = () => {
    if (index < candidates.length - 1) setIndex(i => i + 1);
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Image
      source={{ uri }}
      onError={handleError}
      style={style}
      {...rest}
    />
  );
}
