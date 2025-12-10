import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchHistoricalRates } from '../services/currencyService';
import { ChartDataPoint } from '../types';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface CurrencyChartProps {
  currentRate: number;
}

// --- Smoothing Utils ---
const getControlPoint = (
  current: number[],
  previous: number[],
  next: number[],
  reverse: boolean,
  smoothing: number = 0.2
) => {
  const p = previous || current;
  const n = next || current;
  const angle = Math.atan2(n[1] - p[1], n[0] - p[0]) + (reverse ? Math.PI : 0);
  const length = Math.sqrt(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)) * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const generateSmoothPath = (points: number[][]) => {
  if (points.length === 0) return "";
  
  const d = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point[0]},${point[1]}`;
    
    const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point, false);
    const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);
    
    return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  }, "");
  
  return d;
};

export const CurrencyChart: React.FC<CurrencyChartProps> = ({ currentRate }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const cached = localStorage.getItem('pesoPro_history_15d');
      const cachedTime = localStorage.getItem('pesoPro_history_time_15d');
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (cached && cachedTime && (now - parseInt(cachedTime) < oneDay)) {
        setData(JSON.parse(cached));
        setLoading(false);
      } else {
        const points = await fetchHistoricalRates();
        if (points.length > 0) {
          setData(points);
          localStorage.setItem('pesoPro_history_15d', JSON.stringify(points));
          localStorage.setItem('pesoPro_history_time_15d', now.toString());
        }
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const mergedData = useMemo<ChartDataPoint[]>(() => {
    if (data.length === 0) {
      return [{
        date: new Date().toISOString(),
        rate: currentRate
      }];
    }
    return data.map((point, index) => 
      index === data.length - 1 ? { ...point, rate: currentRate } : point
    );
  }, [data, currentRate]);

  const chartStats = useMemo(() => {
    if (mergedData.length === 0) return { min: 0, max: 0, trend: 0 };
    const rates = mergedData.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const first = rates[0];
    const last = rates[rates.length - 1];
    const trend = ((last - first) / first) * 100;
    return { min, max, trend };
  }, [mergedData]);

  const handleInteraction = (clientX: number) => {
    if (!svgRef.current || mergedData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const padding = 10;
    const effectiveWidth = width - (padding * 2);
    const relativeX = Math.max(0, Math.min(x - padding, effectiveWidth));
    const index = mergedData.length > 1 
      ? Math.round((relativeX / effectiveWidth) * (mergedData.length - 1))
      : 0;
    setActiveIndex(index);
  };

  const onMouseMove = (e: React.MouseEvent) => handleInteraction(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleInteraction(e.touches[0].clientX);

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 h-64 flex items-center justify-center animate-pulse">
        <div className="h-48 w-full bg-slate-800 rounded-xl opacity-50"></div>
      </div>
    );
  }

  if (mergedData.length === 0) return null;

  // Dimensions
  const width = 300;
  const height = 180;
  const padding = 15;

  const normalizeY = (val: number) => {
    const range = chartStats.max - chartStats.min || 1;
    const displayHeight = height - (padding * 2);
    const verticalPadding = displayHeight * 0.15;
    const availableHeight = displayHeight - (verticalPadding * 2);
    return (height - padding - verticalPadding) - ((val - chartStats.min) / range) * availableHeight;
  };

  const normalizeX = (index: number) => {
    if (mergedData.length <= 1) {
      return width / 2;
    }
    return padding + (index / (mergedData.length - 1)) * (width - (padding * 2));
  };

  // Generate coordinates
  const coordinates = mergedData.map((d, i) => [normalizeX(i), normalizeY(d.rate)]);
  
  // Generate Smooth Path
  const linePath = generateSmoothPath(coordinates);
  const areaPath = `${linePath} L ${width - padding},${height} L ${padding},${height} Z`;

  // Active Data
  const lastIndex = mergedData.length - 1;
  const clampedIndex = Math.max(0, Math.min(activeIndex ?? lastIndex, lastIndex));
  const activePoint = mergedData[clampedIndex];
  const activeX = normalizeX(clampedIndex);
  const activeY = normalizeY(activePoint.rate);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden ring-1 ring-white/5">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-xl shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Market Trend</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Last 15 Days
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
          chartStats.trend >= 0 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {chartStats.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(chartStats.trend).toFixed(2)}%
        </div>
      </div>

      <div className="p-4 relative select-none touch-none">
        {/* Dynamic Stats Display */}
        <div className="flex justify-between text-xs font-medium mb-2 px-2 items-end h-8">
          <div className="text-slate-500 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-70">Low</span>
            <span className="text-slate-300 font-mono">${chartStats.min.toFixed(2)}</span>
          </div>
          
          <div className="text-center flex flex-col items-center -mt-2">
             <span className="text-[10px] text-slate-400 mb-1">
                {activeIndex !== null ? formatDate(activePoint.date) : 'Live Rate'}
             </span>
             <span className="text-2xl font-bold text-white tracking-tight font-mono leading-none">
                <span className="text-emerald-500 mr-1">$</span>{activePoint.rate.toFixed(4)}
             </span>
          </div>

          <div className="text-slate-500 text-right flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-70">High</span>
            <span className="text-slate-300 font-mono">${chartStats.max.toFixed(2)}</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative w-full aspect-[1.8/1] mt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible cursor-crosshair"
            onMouseMove={onMouseMove}
            onMouseLeave={() => setActiveIndex(null)}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="chartGradientDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
              </filter>
            </defs>

            {/* Horizontal Grid Lines (Subtle) */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
              const y = padding + ratio * (height - padding * 2);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              );
            })}

            {/* Area Fill */}
            <path
              d={areaPath}
              fill="url(#chartGradientDark)"
              stroke="none"
              style={{ transition: 'd 0.3s ease' }}
            />

            {/* Main Line (with Glow) */}
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{ transition: 'd 0.3s ease' }}
            />

            {/* Active Interaction Line */}
            {activeIndex !== null && (
              <line
                x1={activeX}
                y1={padding}
                x2={activeX}
                y2={height}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            )}

            {/* Active Dot */}
            <circle
              cx={activeX}
              cy={activeY}
              r="6"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#dotShadow)"
              className="transition-all duration-75 ease-out"
            />
          </svg>
        </div>
        
        <div className="mt-4 text-center opacity-40">
           <div className="h-1 w-12 bg-slate-700 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};