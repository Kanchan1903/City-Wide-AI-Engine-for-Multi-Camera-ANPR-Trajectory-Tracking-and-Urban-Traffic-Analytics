import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const DensityChart = ({ data }: { data: any[] }) => {
 const chartRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (!chartRef.current || !data.length) return;
 
 // Clear previous
 d3.select(chartRef.current).selectAll('*').remove();
 
 const width = chartRef.current.clientWidth;
 const height = 200;
 const margin = { top: 20, right: 20, bottom: 30, left: 40 };

 const svg = d3.select(chartRef.current)
 .append('svg')
 .attr('width', width)
 .attr('height', height);

 // X Scale
 const x = d3.scaleTime()
 .domain(d3.extent(data, (d: any) => new Date(d.time_bucket)) as [Date, Date])
 .range([margin.left, width - margin.right]);

 // Y Scale
 const y = d3.scaleLinear()
 .domain([0, d3.max(data, (d: any) => d.vehicle_count) || 100])
 .range([height - margin.bottom, margin.top]);

 // Line generator
 const line = d3.line<any>()
 .x(d => x(new Date(d.time_bucket)))
 .y(d => y(d.vehicle_count))
 .curve(d3.curveMonotoneX);

 // Area generator for glow
 const area = d3.area<any>()
 .x(d => x(new Date(d.time_bucket)))
 .y0(height - margin.bottom)
 .y1(d => y(d.vehicle_count))
 .curve(d3.curveMonotoneX);

 // Add Area
 svg.append('path')
 .datum(data)
 .attr('fill', 'var(--cc-primary-dim)')
 .attr('d', area);

 // Add Line
 svg.append('path')
 .datum(data)
 .attr('fill', 'none')
 .attr('stroke', 'var(--cc-primary)')
 .attr('stroke-width', 2)
 .attr('d', line);

 // Add Axes
 svg.append('g')
 .attr('transform', `translate(0,${height - margin.bottom})`)
 .call(d3.axisBottom(x).ticks(5))
 .attr('color', 'var(--cc-text-muted)')
 .attr('font-family', 'JetBrains Mono');

 svg.append('g')
 .attr('transform', `translate(${margin.left},0)`)
 .call(d3.axisLeft(y).ticks(5))
 .attr('color', 'var(--cc-text-muted)')
 .attr('font-family', 'JetBrains Mono');

 }, [data]);

 return <div ref={chartRef} className="w-full h-[200px]" />;
};
