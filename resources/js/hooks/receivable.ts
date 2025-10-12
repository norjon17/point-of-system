import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { ReceivableFormType } from "../types/formTypes"
import { notifications } from "@mantine/notifications"

export const useReceivable = () => {
  const update = async (data: ReceivableFormType, id: number) => {
    try {
      const res = await http.put(`${API.RECEIVABLE}/${id}`, data)
      notifications.show({
        title: "Success",
        message: res.data as string,
        color: "green",
      })

      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return { update }
}
