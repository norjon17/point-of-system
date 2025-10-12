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
import { CategoryFormType } from "../types/formTypes"

interface IProps {
  enableCategories?: boolean
}

export const useCategories = ({ enableCategories }: IProps = {}) => {
  const [filterData, setFilterData] = useState<SalesFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "updated_at",
    },
  })

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: categoriesRefetch,
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

        const res = await http.post(`${API.CATEGORIES}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.CATEGORIES}-all`, { ...filterData }],
    enabled: enableCategories,
  })

  const addCategory = async (data: CategoryFormType) => {
    try {
      await http.post(`${API.CATEGORIES}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  const updateCategory = async (data: CategoryFormType) => {
    try {
      await http.put(`${API.CATEGORIES}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    categories,
    categoriesLoading,
    categoriesRefetch,
    filterData,
    setFilterData,
    addCategory,
    updateCategory,
  }
}

export type SalesFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
