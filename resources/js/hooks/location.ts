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
import { LocationFormType } from "../types/formTypes"

interface IProps {
  enableLocation?: boolean
}

export const useLocation = ({ enableLocation }: IProps = {}) => {
  const [filterData, setFilterData] = useState<UOMFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "updated_at",
    },
  })

  const {
    data: locations,
    isLoading: locationsLoading,
    refetch: locationsRefetch,
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

        const res = await http.post(`${API.LOCATION}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.LOCATIONS}-all`, { ...filterData }],
    enabled: enableLocation,
  })

  const addLocation = async (data: LocationFormType) => {
    try {
      await http.post(`${API.LOCATION}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateLocation = async (data: LocationFormType) => {
    try {
      await http.put(`${API.LOCATION}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    locations,
    locationsLoading,
    locationsRefetch,
    filterData,
    setFilterData,
    addLocation,
    updateLocation,
  }
}

export type UOMFilterType = {
  rows: number
  page: number
  search?: string
  user_id?: number | null
  order_by?: IsSortedType
}
