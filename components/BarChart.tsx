import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import tw from '@/lib/tw';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  defaultColor?: string;
  showLabels?: boolean;
}

export default function BarChart({
  data,
  height = 200,
  defaultColor = '#0284c7',
  showLabels = true,
}: BarChartProps) {
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
  const barWidth = chartWidth / data.length - 10;

  return (
    <View style={{ height, width }}>
      <Svg width={width} height={height}>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const x = padding + (index * chartWidth) / data.length + 5;
          const y = height - padding - barHeight;
          const color = point.color || defaultColor;

          return (
            <React.Fragment key={`bar-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
              />
              {showLabels && (
                <>
                  <SvgText
                    x={x + barWidth / 2}
                    y={height - 10}
                    fontSize="10"
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    {point.label}
                  </SvgText>
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize="11"
                    fill="#374151"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {point.value}
                  </SvgText>
                </>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
