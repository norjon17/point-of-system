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
import { SupplierFormType } from "../types/formTypes"

interface IProps {
  enableSupplier?: boolean
}

export const useSupplier = ({ enableSupplier }: IProps = {}) => {
  const [filterData, setFilterData] = useState<SupplierFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "last_transaction",
    },
  })

  const {
    data: suppliers,
    isLoading: suppliersLoading,
    refetch: suppliersRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: SupplierFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.SUPPLIER}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.SUPPLIER}-all`, { ...filterData }],
    enabled: enableSupplier,
  })

  const addSupplier = async (data: SupplierFormType) => {
    try {
      await http.post(`${API.SUPPLIER}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateSupplier = async (data: SupplierFormType) => {
    try {
      await http.put(`${API.SUPPLIER}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    suppliers,
    suppliersLoading,
    suppliersRefetch,
    filterData,
    setFilterData,
    addSupplier,
    updateSupplier,
  }
}

export type SupplierFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
