import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import tw from '@/lib/tw';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  showGrid?: boolean;
}

export default function LineChart({
  data,
  height = 200,
  color = '#0284c7',
  showLabels = true,
  showGrid = true,
}: LineChartProps) {
  const width = Dimensions.get('window').width - 48;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[tw`bg-gray-50 rounded-lg p-4`, { height }]}>
        <Text style={tw`text-center text-gray-500`}>Немає даних</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return height - padding - ((value - minValue) / valueRange) * chartHeight;
  };

  const pathData = data
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <View style={{ height, width }}>
      <Svg width={width} height={height}>
        {showGrid && (
          <>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding + chartHeight * ratio;
              return (
                <Line
                  key={`grid-${i}`}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}
          </>
        )}

        <Path d={pathData} stroke={color} strokeWidth="3" fill="none" />

        {data.map((point, index) => {
          const x = getX(index);
          const y = getY(point.value);
          return (
            <Circle key={`point-${index}`} cx={x} cy={y} r="5" fill={color} />
          );
        })}

        {showLabels && (
          <>
            {data.map((point, index) => {
              const x = getX(index);
              return (
                <SvgText
                  key={`label-${index}`}
                  x={x}
                  y={height - 10}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              );
            })}

            {[maxValue, Math.round(maxValue * 0.5), minValue].map((value, i) => {
              const y = padding + (chartHeight * i) / 2;
              return (
                <SvgText
                  key={`value-${i}`}
                  x={padding - 10}
                  y={y + 4}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {Math.round(value)}
                </SvgText>
              );
            })}
          </>
        )}
      </Svg>
    </View>
  );
}
