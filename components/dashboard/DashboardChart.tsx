'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Box } from '@mui/material'

interface ChartData {
  date: string
  income: number
  expense: number
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  // Group by date and sum
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { date: item.date, income: 0, expense: 0 }
    }
    acc[item.date].income += item.income
    acc[item.date].expense += item.expense
    return acc
  }, {} as Record<string, ChartData>)

  const chartData = Object.values(grouped).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  if (chartData.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </Box>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString()
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#4caf50" 
          strokeWidth={2}
          name="Income"
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          stroke="#f44336" 
          strokeWidth={2}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

