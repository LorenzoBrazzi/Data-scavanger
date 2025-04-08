
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { VulnerabilityReport } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DataVisualizationProps {
  report: VulnerabilityReport;
}

const DataVisualization = ({ report }: DataVisualizationProps) => {
  const { stats } = report;
  
  // Transform data for the pie chart (top 5 categories)
  const pieData = Object.entries(stats.dataExposureByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Sort by highest value
    .slice(0, 5);  // Show top 5 categories
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Format the breach timeline data
  const timelineData = stats.breachTimeline.map((item) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    breaches: item.count
  }));
  
  // Format risk by data type (top 5 risk areas)
  const riskByTypeData = stats.riskByDataType
    .sort((a, b) => b.riskScore - a.riskScore) // Sort by highest risk score
    .slice(0, 5); 
  
  // Prepare data for digital presence score
  const digitalScoreData = [
    {
      name: "Score",
      value: stats.digitalPresenceScore,
      fill: stats.digitalPresenceScore > 70 ? '#FF0000' : 
            stats.digitalPresenceScore > 40 ? '#FFA500' : '#00C49F'
    }
  ];

  return (
    <Tabs defaultValue="exposure" className="space-y-4">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
        <TabsTrigger value="exposure">Data Exposure</TabsTrigger>
        <TabsTrigger value="timeline">Breach Timeline</TabsTrigger>
        <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        <TabsTrigger value="presence">Digital Presence</TabsTrigger>
      </TabsList>
      
      <TabsContent value="exposure">
        <Card>
          <CardHeader>
            <CardTitle>Exposed Data Categories</CardTitle>
            <CardDescription>
              Types of data exposed in breaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      label: "Breaches",
                      color: "#8884d8",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${Math.round(Number(percent) * 100)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent labelClassName="font-medium" />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <Alert variant="default" className="bg-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No data exposure categories found.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Breach Timeline</CardTitle>
            <CardDescription>
              When your data was exposed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <div className="h-80">
                <ChartContainer
                  config={{
                    breaches: {
                      label: "Breaches",
                      color: "#8884d8",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 30,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{fontSize: 10}}
                      />
                      <YAxis />
                      <Line
                        type="monotone"
                        dataKey="breaches"
                        strokeWidth={2}
                        activeDot={{
                          r: 6,
                          style: { fill: "var(--color-breaches)", opacity: 0.8 },
                        }}
                        style={{
                          stroke: "var(--color-breaches)",
                        }}
                      />
                      <ChartTooltip content={<ChartTooltipContent labelClassName="font-medium" />} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <Alert variant="default" className="bg-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No breach timeline data available.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="risk">
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis by Data Type</CardTitle>
            <CardDescription>
              Risk level associated with different exposed data types
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riskByTypeData.length > 0 ? (
              <div className="h-80">
                <ChartContainer
                  config={{
                    riskScore: {
                      label: "Risk Score",
                      color: "#FF8042",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={riskByTypeData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 20,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        type="category" 
                        dataKey="type" 
                        width={120}
                        tick={{fontSize: 12}}
                      />
                      <ChartTooltip 
                        formatter={(value) => [`${value}/100`, 'Risk Score']}
                      />
                      <Bar
                        dataKey="riskScore"
                        style={{
                          fill: "var(--color-riskScore)",
                          opacity: 0.8,
                        }}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <Alert variant="default" className="bg-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No risk data available for analysis.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="presence">
        <Card>
          <CardHeader>
            <CardTitle>Digital Presence Score</CardTitle>
            <CardDescription>
              How visible your digital identity is online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center">
              <ChartContainer
                config={{
                  value: {
                    label: "Digital Presence",
                    color: "#8884d8",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="80%" 
                    barSize={10}
                    data={digitalScoreData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold"
                    >
                      {stats.digitalPresenceScore}%
                    </text>
                    <ChartTooltip content={<ChartTooltipContent labelClassName="font-medium" />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {stats.digitalPresenceScore > 70
                  ? "High visibility. Your digital footprint is extensive and easily discoverable."
                  : stats.digitalPresenceScore > 40
                  ? "Moderate visibility. You have a notable online presence."
                  : "Low visibility. Your digital footprint is minimal."}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DataVisualization;
