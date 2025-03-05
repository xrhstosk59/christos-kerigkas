// src/components/trading-dashboard.tsx
'use client'

import { useState } from 'react'
import { useTheme } from './theme-provider'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Mock data for the charts
const performanceData = [
  { name: 'Jan', btc: 4000, eth: 2400, overall: 2400 },
  { name: 'Feb', btc: 3000, eth: 1398, overall: 2210 },
  { name: 'Mar', btc: 2000, eth: 9800, overall: 2290 },
  { name: 'Apr', btc: 2780, eth: 3908, overall: 2000 },
  { name: 'May', btc: 1890, eth: 4800, overall: 2181 },
  { name: 'Jun', btc: 2390, eth: 3800, overall: 2500 },
  { name: 'Jul', btc: 3490, eth: 4300, overall: 2100 },
  { name: 'Aug', btc: 4000, eth: 2400, overall: 2400 },
  { name: 'Sep', btc: 3000, eth: 1398, overall: 2210 },
  { name: 'Oct', btc: 2000, eth: 9800, overall: 2290 },
  { name: 'Nov', btc: 2780, eth: 3908, overall: 2000 },
  { name: 'Dec', btc: 1890, eth: 4800, overall: 2181 },
];

const strategyPerformance = [
  { name: 'SMA Crossover', win: 65, loss: 35 },
  { name: 'MACD', win: 72, loss: 28 },
  { name: 'RSI Reversal', win: 58, loss: 42 },
  { name: 'Bollinger Bands', win: 68, loss: 32 },
  { name: 'Ichimoku Cloud', win: 55, loss: 45 },
];

// Trading stats cards data
const tradingStats = [
  {
    title: 'Overall Profit',
    value: '+$12,234',
    change: '+14.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Win Rate',
    value: '68.2%',
    change: '+3.1%',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    title: 'Avg. Trade Duration',
    value: '4.3 days',
    change: '-0.8 days',
    trend: 'down',
    icon: Activity,
  },
];

export default function TradingDashboard() {
  const [timeRange, setTimeRange] = useState('year')
  const { theme } = useTheme()
  
  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={cn(
            "text-3xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Trading Analytics
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </Button>
            <Button
              variant={timeRange === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tradingStats.map((stat, index) => (
            <Card key={index} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cn(
                  "text-sm font-medium",
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                )}>
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn(
                  "h-4 w-4",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )} />
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-2xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {stat.value}
                </div>
                <p className={`text-xs flex items-center ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {stat.change} vs previous period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Chart */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Portfolio Performance
            </CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Track your trading bot performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                  />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#111827'
                    }} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="btc"
                    stroke="#8884d8"
                    name="BTC Trades"
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eth" 
                    stroke="#82ca9d" 
                    name="ETH Trades" 
                  />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#ff7300"
                    name="Overall Portfolio"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Strategy Performance
            </CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Win/loss ratio for different trading strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={strategyPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                  />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#111827'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="win" name="Win %" fill="#10b981" stackId="a" />
                  <Bar dataKey="loss" name="Loss %" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}