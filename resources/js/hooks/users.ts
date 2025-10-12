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
import { UserFormType } from "../types/formTypes"

interface IProps {
  enableUsers?: boolean
}

export const useUsers = ({ enableUsers }: IProps = {}) => {
  const [filterData, setFilterData] = useState<UsersFilterType>({
    rows: 50,
    page: 1,
    search: "",
    // order_by: {
    //   sort: "desc",
    //   id: "last_transaction",
    // },
  })

  const {
    data: users,
    isLoading: usersLoading,
    refetch: usersRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: UsersFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.USERS}/all`, formData)
        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.PRODUCT}`, { ...filterData }],
    enabled: enableUsers,
  })

  const addUser = async (data: UserFormType) => {
    try {
      await http.post(`${API.USERS}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateUser = async (data: UserFormType) => {
    try {
      await http.put(`${API.USERS}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    users,
    usersLoading,
    usersRefetch,
    filterData,
    setFilterData,
    addUser,
    updateUser,
  }
}

export type UsersFilterType = {
  rows: number
  page: number
  search?: string
  order_by?: IsSortedType | null
}
