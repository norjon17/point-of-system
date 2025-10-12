import { useQuery, useQueryClient } from "@tanstack/react-query"
import { APP_DEBUG, DEF_MSG, QUERY_NAME } from "../constants/constants"
import { LoginType, PasswordResetType, UserType } from "../types/index"
import { AxiosError } from "axios"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { notifications } from "@mantine/notifications"

interface IProps {
  enableUser?: boolean
}

export const useAuth = ({ enableUser = false }: IProps = {}) => {
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
    isFetching: userFetchingLoading,
  } = useQuery<UserType | null, AxiosError>({
    queryFn: async () => {
      try {
        await http.get(API.CSRF_TOKEN)
        const res = await http.get(API.USER)
        if (APP_DEBUG) {
          console.log(res.data)
        }
        return res.data as UserType
      } catch (e) {
        const error = e as AxiosError
        console.error(error)

        return null
      }
    },
    queryKey: [QUERY_NAME.USER],
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: enableUser,
  })

  const queryClient = useQueryClient()
  const userData = queryClient.getQueryData([QUERY_NAME.USER]) as UserType

  const login = async (data: LoginType): Promise<UserType> => {
    try {
      // Get CSRF token
      await http.get(API.CSRF_TOKEN)

      // Send login request
      const res = await http.post(API.LOGIN, data)
      return res.data as UserType
    } catch (e) {
      const error = e as AxiosError
      console.error(error)
      let tmessage = DEF_MSG.SERVER_ERR_MSG
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          tmessage = error.response.data as string
        } else if (typeof error.response.data === "object") {
          const { message } = error.response.data as any
          if (message) {
            tmessage = message as string
          }
        }
      }
      notifications.show({
        title: "Error",
        message: tmessage,
        color: "red",
      })
      throw new Error(tmessage)
    }
  }

  const logout = async (): Promise<Boolean | string> => {
    try {
      await http.post(API.LOGOUT)
      return true
    } catch (e) {
      const error = e as AxiosError
      console.error(error)
      let tmessage = DEF_MSG.SERVER_ERR_MSG
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          tmessage = error.response.data as string
        } else if (typeof error.response.data === "object") {
          const { message } = error.response.data as any
          if (message) {
            tmessage = message as string
          }
        }
      }
      notifications.show({
        title: "Error",
        message: tmessage,
        color: "red",
      })
      return tmessage
    }
  }

  const updatePassword = async (data: PasswordResetType) => {
    try {
      await http.post(API.UPDATE_PASSWORD, data)

      notifications.show({
        title: "Success",
        message:
          // "Your password has been successfully updated. After this notification closes, the page will refresh and you must input your new password.",
          "Your password has been successfully updated.",
        color: "green",
        onClose: () => {
          // Trigger page refresh or any other action
          // window.location.reload()
        },
      })
    } catch (e) {
      const error = e as AxiosError
      console.error(error)

      if (error.response && error.response.data) {
        notifications.show({
          title: "Server error",
          message: error.response.data as string,
          color: "red",
        })
      }
    }
  }

  return {
    user,
    userData,
    userLoading,
    refetchUser,
    userFetchingLoading,
    login,
    logout,
    updatePassword,
  }
}
