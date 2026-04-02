import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AnalysisResult } from "@/lib/resumeAnalyzer";

interface ScoreBreakdownChartProps {
  analysis: AnalysisResult;
}

const ScoreBreakdownChart = ({ analysis }: ScoreBreakdownChartProps) => {
  const data = [
    { name: "Skills", score: analysis.skillsScore, weight: "40%", fill: "hsl(var(--primary))" },
    { name: "Keywords", score: analysis.keywordScore, weight: "25%", fill: "hsl(var(--accent))" },
    { name: "Formatting", score: analysis.formattingScore, weight: "20%", fill: "hsl(var(--info))" },
    { name: "Sections", score: analysis.sectionsScore, weight: "15%", fill: "hsl(var(--warning))" },
  ];

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 13,
            }}
            formatter={(value: number, _name: string, props: any) => [
              `${value}/100 (weight: ${props.payload.weight})`,
              "Score",
            ]}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreBreakdownChart;
