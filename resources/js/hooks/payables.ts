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
import { CashTransactionType } from "../types"

interface IProps {
  enablePayable?: boolean
  enablePaymentHistory?: boolean
  receive_id?: number
}

export const usePayables = ({
  enablePayable,
  enablePaymentHistory,
  receive_id,
}: IProps = {}) => {
  const [filterData, setFilterData] = useState<SalesFilterType>({
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

        let formData: SalesFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.PAYABLE}/all`, formData)
        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.PAYABLES}-all`, { ...filterData }],
    enabled: enablePayable,
  })

  const {
    data: paymentHistory,
    isLoading: paymentHistoryLoading,
    refetch: paymentHistoryRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.PAYABLE}/history-all/${receive_id}`)
        return res.data as CashTransactionType[]
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return []
      }
    },
    queryKey: [`${QUERY_NAME.PAYABLES}-history-all`, { receive_id }],
    enabled: enablePaymentHistory && receive_id ? true : false,
  })

  return {
    transactions,
    transactionsLoading,
    transactionsRefetch,
    filterData,
    setFilterData,
    paymentHistory,
    paymentHistoryLoading,
    paymentHistoryRefetch,
  }
}

export type SalesFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
