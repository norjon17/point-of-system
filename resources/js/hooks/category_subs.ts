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
import { CategorySubFormType } from "../types/formTypes"

interface IProps {
  enableCatSub?: boolean
  cat_id?: number
}

export const useCategorySub = ({
  enableCatSub = false,
  cat_id,
}: IProps = {}) => {
  const [filterData, setFilterData] = useState<CatSubFilterType>({
    rows: 10,
    page: 1,
    search: "",
    cat_id,
    order_by: {
      sort: "desc",
      id: "updated_at",
    },
  })

  const {
    data: categorySub,
    isLoading: categorySubLoading,
    refetch: categorySubRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: CatSubFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.CATEGORY_SUBS}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.CATEGORY_SUBS}-all`, { ...filterData }],
    enabled: enableCatSub,
  })

  const addCategory = async (data: CategorySubFormType) => {
    try {
      console.log(data)
      await http.post(`${API.CATEGORY_SUBS}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  const updateCategory = async (data: CategorySubFormType) => {
    try {
      await http.put(`${API.CATEGORY_SUBS}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    categorySub,
    categorySubLoading,
    categorySubRefetch,
    filterData,
    setFilterData,
    addCategory,
    updateCategory,
  }
}

export type CatSubFilterType = {
  rows: number
  page: number
  search?: string
  cat_id?: number
  user_id?: number | null
  order_by?: IsSortedType
}
