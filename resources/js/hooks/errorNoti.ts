import { AxiosError } from "axios"
import { DEF_MSG } from "../constants/constants"
import { notifications } from "@mantine/notifications"

export const handleErrorMessage = (error: AxiosError) => {
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
}
