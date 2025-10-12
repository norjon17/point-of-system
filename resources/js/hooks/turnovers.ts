import { useState } from "react"
import {
  IsSortedType,
  PaginationType,
} from "../components/TanStackMantine/TanStackMantineCPag"
import { removeWhiteSpace } from "../utils/string/removeWhiteSpace"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { QUERY_NAME } from "../constants/constants"
import { useQuery } from "@tanstack/react-query"

interface IProps {
  enableTurnovers?: boolean
}

export const useTurnovers = ({ enableTurnovers }: IProps = {}) => {
  const [filterData, setFilterData] = useState<CashTransactionFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "last_transaction",
    },
  })

  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: transactionsRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: CashTransactionFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.TURNOVER}/all`, formData)
        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.TURNOVERS}-all`, { ...filterData }],
    enabled: enableTurnovers,
  })

  return {
    transactions,
    transactionsLoading,
    transactionsRefetch,
    filterData,
    setFilterData,
  }
}

export type CashTransactionFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
