import { useDashboard } from "../../hooks/dashboard"
import { ChartTooltipProps, CompositeChart } from "@mantine/charts"
import { WeeklyCashReportType } from "../../types"
import { Box, Center, Loader, Paper, Stack, Text } from "@mantine/core"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"

export default function AdminDashboard() {
  const { dashboard, dashboardLoading } = useDashboard({
    enableDashboard: true,
    year: 2025,
  })

  function CashWToolTip({ label, payload }: ChartTooltipProps) {
    if (!payload) return null

    let data: WeeklyCashReportType | null = null
    if (payload[0]) {
      data = payload[0].payload as WeeklyCashReportType
    }

    const labelMap = {
      total_in: "Cash In",
      total_out: "Cash Out",
      total_sale: "Sale",
      total_gcash: "GCash",
    }

    return (
      <Paper px="md" py="sm" withBorder shadow="md" radius="md">
        <Text fw={500} mb={5}>
          {data ? data.label : label}
        </Text>
        {payload.map((item: any) => (
          <Text key={item.name} c={item.color} fz="sm">
            {/* @ts-ignore */}
            {labelMap[item.name] ?? item.name}:{" "}
            {formatNumberWithCommas(item.value)}
          </Text>
        ))}
      </Paper>
    )
  }
  function CashMToolTip({ label, payload }: ChartTooltipProps) {
    if (!payload) return null

    let data: WeeklyCashReportType | null = null
    if (payload[0]) {
      data = payload[0].payload as WeeklyCashReportType
    }

    const labelMap = {
      total_in: "Cash In",
      total_out: "Cash Out",
      total_sale: "Sale",
      total_gcash: "GCash",
    }

    return (
      <Paper px="md" py="sm" withBorder shadow="md" radius="md">
        <Text fw={500} mb={5}>
          {data ? data.label : label}
        </Text>
        {payload.map((item: any) => (
          <Text key={item.name} c={item.color} fz="sm">
            {/* @ts-ignore */}
            {labelMap[item.name] ?? item.name}:{" "}
            {formatNumberWithCommas(item.value)}
          </Text>
        ))}
      </Paper>
    )
  }

  return (
    <Box>
      {dashboardLoading && (
        <Center>
          <Loader />
        </Center>
      )}

      {!dashboardLoading && (
        <Stack>
          <Paper shadow="xs" p="xl">
            <CompositeChart
              h={300}
              data={dashboard?.cash_weekly ?? []}
              dataKey="week"
              series={[
                {
                  name: "total_in",
                  color: "green.6", // Strong green for bars
                  type: "bar",
                  label: "Cash In",
                },
                {
                  name: "total_out",
                  color: "red.6", // Red works better than orange for contrast
                  type: "bar",
                  label: "Cash Out",
                },
                {
                  name: "total_sale",
                  color: "indigo.5", // Soft blue-purple for area
                  type: "area",
                  label: "Sale",
                },
                {
                  name: "total_gcash",
                  color: "cyan.6", // Bright cyan for line
                  type: "line",
                  label: "GCash",
                },
              ]}
              withLegend
              tooltipProps={{
                content: ({ label, payload }) => (
                  <CashWToolTip label={label} payload={payload} />
                ),
              }}
            />
          </Paper>

          <Paper shadow="xs" p="xl">
            <CompositeChart
              h={300}
              data={dashboard?.cash_monthly ?? []}
              dataKey="label"
              series={[
                {
                  name: "total_in",
                  color: "green.6", // Strong green for bars
                  type: "bar",
                  label: "Cash In",
                },
                {
                  name: "total_out",
                  color: "red.6", // Red works better than orange for contrast
                  type: "bar",
                  label: "Cash Out",
                },
                {
                  name: "total_sale",
                  color: "indigo.5", // Soft blue-purple for area
                  type: "area",
                  label: "Sale",
                },
                {
                  name: "total_gcash",
                  color: "cyan.6", // Bright cyan for line
                  type: "line",
                  label: "GCash",
                },
              ]}
              withLegend
              tooltipProps={{
                content: ({ label, payload }) => (
                  <CashMToolTip label={label} payload={payload} />
                ),
              }}
            />
          </Paper>
        </Stack>
      )}
    </Box>
  )
}
