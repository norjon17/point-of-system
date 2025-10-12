import { useQuery } from "@tanstack/react-query"
import { handleErrorMessage } from "./errorNoti"
import { QUERY_NAME } from "../constants/constants"
import { AxiosError } from "axios"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { AccessModuleType } from "../types"
import { AccessGroupFormType } from "../types/formTypes"
import { notifications } from "@mantine/notifications"

interface IProps {
  enableAccess?: boolean
  user_id?: number
}

export const useAccess = ({ enableAccess, user_id }: IProps = {}) => {
  const {
    data: accesses,
    isLoading: accessesLoading,
    refetch: accessesRefetch,
    isRefetching: accessesRefetchLoading,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.ACCESSES}/user/${user_id}`)

        return res.data as AccessModuleType[]
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return []
      }
    },
    queryKey: [`${QUERY_NAME.PRODUCT}`, user_id],
    enabled: enableAccess,
  })

  const updateAccess = async (data: AccessGroupFormType) => {
    try {
      const res = await http.post(`${API.ACCESSES}`, data)

      notifications.show({
        title: "Success",
        message: res.data as string,
      })
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return {
    accesses,
    accessesLoading,
    accessesRefetch,
    accessesRefetchLoading,
    updateAccess,
  }
}
