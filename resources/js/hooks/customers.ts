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
import { CustomerFormType } from "../types/formTypes"

interface IProps {
  enableCustomer?: boolean
}

export const useCustomer = ({ enableCustomer }: IProps = {}) => {
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
    data: customers,
    isLoading: customersLoading,
    refetch: customersRefetch,
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

        const res = await http.post(`${API.CUSTOMER}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.CUSTOMERS}-all`, { ...filterData }],
    enabled: enableCustomer,
  })

  const addProduct = async (data: CustomerFormType) => {
    try {
      await http.post(`${API.CUSTOMER}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  const updateCustomer = async (data: CustomerFormType) => {
    try {
      await http.put(`${API.CUSTOMER}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    customers,
    customersLoading,
    customersRefetch,
    filterData,
    setFilterData,
    addProduct,
    updateCustomer,
  }
}

export type SalesFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
