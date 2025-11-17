import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
};

export default function Sparkline({ data, width = 120, height = 40, stroke = '#eab308', strokeWidth = 2 }: SparklineProps) {
  if (!data || data.length === 0) return <View style={{ width, height }} />;

  const clean = data.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return <View style={{ width, height }} />;

  // handle single point
  if (clean.length === 1) {
    const cx = width / 2;
    const cy = height / 2;
    return (
      <View style={{ width, height }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Polyline points={`${cx},${cy} ${cx + 1},${cy}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;

  const stepX = width / (clean.length - 1);

  const points = clean
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      const cx = Number.isFinite(x) ? x : 0;
      const cy = Number.isFinite(y) ? y : height / 2;
      return `${cx},${cy}`;
    })
    .join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <Polyline points={points} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
