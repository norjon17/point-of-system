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
import { UOMFormType } from "../types/formTypes"

interface IProps {
  enableUOM?: boolean
}

export const useUOM = ({ enableUOM }: IProps = {}) => {
  const [filterData, setFilterData] = useState<UOMFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "last_transaction",
    },
  })

  const {
    data: uoms,
    isLoading: uomsLoading,
    refetch: uomsRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: UOMFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.UOM}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.UOMS}-all`, { ...filterData }],
    enabled: enableUOM,
  })

  const addUOM = async (data: UOMFormType) => {
    try {
      await http.post(`${API.UOM}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateUOM = async (data: UOMFormType) => {
    try {
      await http.put(`${API.UOM}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    uoms,
    uomsLoading,
    uomsRefetch,
    filterData,
    setFilterData,
    addUOM,
    updateUOM,
  }
}

export type UOMFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
