"use client";

import { useWeights } from "@/hooks/useWeights";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface WeightChartProps {
  dogId: string;
}

export function WeightChart({ dogId }: WeightChartProps) {
  const { weights, loading, error } = useWeights(dogId);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>体重推移</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-lg">体重データをロード中...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>体重推移</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          <p>エラー: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (weights.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>体重推移</CardTitle>
        </CardHeader>
        <CardContent>
          <p>体重データがありません。</p>
        </CardContent>
      </Card>
    );
  }

  // グラフ表示用にデータを整形
  const chartData = weights
    .map(weight => ({
      date: weight.date.toDate(),
      value: weight.value,
      unit: weight.unit,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // 日付順にソート

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>体重推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(tick) => format(tick, 'MM/dd')} />
            <YAxis label={{ value: `体重 (${chartData[0]?.unit || 'kg'})`, angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit}`, format(props.payload.date, 'yyyy/MM/dd HH:mm')]} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
