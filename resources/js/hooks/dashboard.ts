import { useQuery } from "@tanstack/react-query"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { QUERY_NAME } from "../constants/constants"
import { MonthlyCashReportType, WeeklyCashReportType } from "../types"

interface IProps {
  enableDashboard?: boolean
  year?: number
}

export const useDashboard = ({ enableDashboard, year }: IProps) => {
  const { data: dashboard, isLoading: dashboardLoading } =
    useQuery<DashboardType>({
      queryFn: async () => {
        try {
          const res = await http.get(`${API.DASHBOARD}`, { params: { year } })
          return res.data as DashboardType
        } catch (e) {
          const error = e as AxiosError
          handleErrorMessage(error)
          return {
            cash_weekly: [],
            cash_monthly: [],
          }
        }
      },
      queryKey: [`${QUERY_NAME.DASHBOARD}`],
      enabled: enableDashboard && year ? true : false,
    })
  const { data: dashboardToday, isLoading: dashboardTodayLoading } =
    useQuery<TodayCashSummary>({
      queryFn: async () => {
        try {
          const res = await http.get(`${API.DASHBOARD}-today`)
          return res.data as TodayCashSummary
        } catch (e) {
          const error = e as AxiosError
          handleErrorMessage(error)
          return {
            date: null,
            total_in: null,
            total_out: null,
            total_sale: null,
            total_gcash: null,
            total_receivable: null,
          }
        }
      },
      queryKey: [`${QUERY_NAME.DASHBOARD}-today`],
      enabled: enableDashboard ? true : false,
    })

  return { dashboard, dashboardLoading, dashboardToday, dashboardTodayLoading }
}

export type DashboardType = {
  cash_weekly: WeeklyCashReportType[]

  cash_monthly: MonthlyCashReportType[]
}

export type TodayCashSummary = {
  date: string | null
  total_in: number | null
  total_out: number | null
  total_sale: number | null
  total_gcash: number | null
  total_receivable: number | null
}
