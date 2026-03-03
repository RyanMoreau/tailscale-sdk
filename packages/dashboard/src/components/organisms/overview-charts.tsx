import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useDevices } from "@/hooks/use-devices"
import { useKeys } from "@/hooks/use-keys"
import { getDeviceStatus } from "@/utils/status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function OverviewCharts() {
  const { data: devices } = useDevices()
  const { data: keys } = useKeys()

  const devicePlatformData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const device of devices ?? []) {
      const platform = normalizePlatform(device.os)
      counts.set(platform, (counts.get(platform) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([platform, count]) => ({
        platform,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [devices])

  const keyPostureData = useMemo(() => {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const urgent = keys?.filter((k) => {
      const expires = Date.parse(k.expires)
      return Number.isFinite(expires) && expires > now && expires - now <= day
    }).length ?? 0

    const warning = keys?.filter((k) => {
      const expires = Date.parse(k.expires)
      return Number.isFinite(expires) && expires - now > day && expires - now <= day * 7
    }).length ?? 0

    const healthy = Math.max((keys?.length ?? 0) - urgent - warning, 0)

    const reusable = keys?.filter((k) => Boolean(k.capabilities?.devices?.create?.reusable)).length ?? 0
    const ephemeral = keys?.filter((k) => Boolean(k.capabilities?.devices?.create?.ephemeral)).length ?? 0
    const preauthorized = keys?.filter((k) => Boolean(k.capabilities?.devices?.create?.preauthorized)).length ?? 0

    return [
      { metric: "Under 24h", value: urgent, fill: "hsl(var(--destructive))" },
      { metric: "1-7 days", value: warning, fill: "#eab308" },
      { metric: "7+ days", value: healthy, fill: "hsl(var(--primary))" },
      { metric: "Reusable", value: reusable, fill: "#06b6d4" },
      { metric: "Ephemeral", value: ephemeral, fill: "#a855f7" },
      { metric: "Preauth", value: preauthorized, fill: "#22c55e" },
    ]
  }, [keys])

  const onlineCount = useMemo(
    () => devices?.filter((d) => getDeviceStatus(d.lastSeen) === "online").length ?? 0,
    [devices]
  )
  const pendingCount = useMemo(() => devices?.filter((d) => !d.authorized).length ?? 0, [devices])
  const totalDevices = devices?.length ?? 0

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Device Platform Mix</CardTitle>
          <CardDescription>Where your tailnet is running right now</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md border px-2 py-1.5">
              <p>Total</p>
              <p className="text-sm font-semibold text-foreground">{totalDevices}</p>
            </div>
            <div className="rounded-md border px-2 py-1.5">
              <p>Online</p>
              <p className="text-sm font-semibold text-foreground">{onlineCount}</p>
            </div>
            <div className="rounded-md border px-2 py-1.5">
              <p>Pending</p>
              <p className="text-sm font-semibold text-foreground">{pendingCount}</p>
            </div>
          </div>
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer data={devicePlatformData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.28)" />
                <XAxis
                  dataKey="platform"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.18)" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={6}
                  activeBar={{ fill: "hsl(var(--primary))", fillOpacity: 0.9, stroke: "none" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Key Posture</CardTitle>
          <CardDescription>Expiry pressure and key capability footprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer data={keyPostureData} margin={{ left: 10, right: 10, top: 8 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.28)" />
                <XAxis
                  dataKey="metric"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.18)" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
                <Bar
                  dataKey="value"
                  radius={6}
                  activeBar={{ fillOpacity: 0.9, stroke: "none" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function normalizePlatform(os: string | null | undefined): string {
  const value = (os ?? "").trim().toLowerCase()
  if (!value) return "Unknown"
  if (value.includes("ios")) return "iOS"
  if (value.includes("mac") || value.includes("darwin")) return "macOS"
  if (value.includes("windows")) return "Windows"
  if (value.includes("android")) return "Android"
  if (value.includes("linux")) return "Linux"
  return value.charAt(0).toUpperCase() + value.slice(1)
}
