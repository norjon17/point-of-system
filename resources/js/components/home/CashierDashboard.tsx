import {
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { useDashboard } from "../../hooks/dashboard"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import moment from "moment"

export default function CashierDashboard() {
  const { dashboardToday, dashboardTodayLoading } = useDashboard({
    enableDashboard: true,
  })

  if (dashboardTodayLoading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    )
  }

  if (!dashboardToday) {
    return (
      <Center h={300}>
        <Text color="dimmed">No data available</Text>
      </Center>
    )
  }

  return (
    <Center>
      <Card shadow="md" padding="lg" radius="md" w={400}>
        <Stack gap="sm">
          <Title order={4}>Cash Summary</Title>

          <Text size="sm" c="dimmed">
            Date: {moment(dashboardToday.date).format("MMMM DD, YYYY")}
          </Text>

          <Divider />

          <Group>
            <Text>Cash In</Text>
            <Text fw={500} c="green.6">
              ₱ {formatNumberWithCommas(dashboardToday.total_in ?? 0)}
            </Text>
          </Group>

          <Group>
            <Text>Cash Out</Text>
            <Text fw={500} c="red.6">
              ₱ {formatNumberWithCommas(dashboardToday.total_out ?? 0)}
            </Text>
          </Group>

          <Group>
            <Text>Sales</Text>
            <Text fw={500} c="indigo.6">
              ₱ {formatNumberWithCommas(dashboardToday.total_sale ?? 0)}
            </Text>
          </Group>

          <Group>
            <Text>GCash</Text>
            <Text fw={500} c="cyan.6">
              ₱ {formatNumberWithCommas(dashboardToday.total_gcash ?? 0)}
            </Text>
          </Group>

          <Group>
            <Text>Receivable</Text>
            <Text fw={500} c="orange.6">
              ₱ {formatNumberWithCommas(dashboardToday.total_receivable ?? 0)}
            </Text>
          </Group>
        </Stack>
      </Card>
    </Center>
  )
}
