"use client";

import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { formatCurrency } from "../_lib/api";
import { Card } from "./ui";

export function BalanceChart({ points }: { points: Array<{ month: string; balance: number }> }) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(points.length - 1, 0));
  const selected = points[selectedIndex];
  const chart = useMemo(() => {
    const width = 640;
    const height = 220;
    const padding = 34;
    const values = points.map((point) => point.balance);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const spread = max - min || 1;
    const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const coordinates = points.map((point, index) => ({
      ...point,
      x: padding + index * step,
      y: height - padding - ((point.balance - min) / spread) * (height - padding * 2),
    }));
    const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
    const areaPath =
      coordinates.length > 0
        ? `${path} L ${coordinates[coordinates.length - 1].x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`
        : "";

    return { width, height, coordinates, path, areaPath };
  }, [points]);

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--on-surface)]">Evolução do saldo</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">Toque em um mês para ver o valor</p>
        </div>
        <LineChart className="h-5 w-5 shrink-0 text-[var(--primary)]" />
      </div>

      {selected ? (
        <div className="mb-4 rounded-2xl bg-[var(--surface-container-low)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">{selected.month}</p>
          <strong className="mt-1 block text-2xl font-black text-[var(--on-surface)]">{formatCurrency(selected.balance)}</strong>
        </div>
      ) : null}

      <div className="rounded-2xl bg-[var(--surface-card)]">
        <svg className="h-56 w-full touch-manipulation sm:h-64" preserveAspectRatio="none" viewBox={`0 0 ${chart.width} ${chart.height}`}>
          <defs>
            <linearGradient id="balance-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={chart.areaPath} fill="url(#balance-area)" />
          <path d={chart.path} fill="none" stroke="var(--primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {chart.coordinates.map((point, index) => {
            const active = index === selectedIndex;

            return (
              <g
                aria-label={`${point.month}: ${formatCurrency(point.balance)}`}
                key={point.month}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelectedIndex(index);
                }}
                role="button"
                tabIndex={0}
              >
                <circle cx={point.x} cy={point.y} fill="transparent" r="24" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill="#ffffff"
                  r={active ? "8" : "5"}
                  stroke={active ? "var(--secondary)" : "var(--primary)"}
                  strokeWidth={active ? "4" : "3"}
                />
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-3 gap-2 px-2 pb-3 sm:grid-cols-6">
          {points.map((point, index) => (
            <button
              className={`rounded-xl px-2 py-2 text-center text-xs font-bold transition ${
                index === selectedIndex
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
              }`}
              key={point.month}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <span className="block">{point.month}</span>
              <span className="mt-1 block truncate text-[10px] opacity-80">{formatCurrency(point.balance)}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
