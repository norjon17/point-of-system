import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { PayableFormType, ReceiveProductForm } from "../types/formTypes"
import { notifications } from "@mantine/notifications"

export const usePayable = () => {
  const update = async (data: PayableFormType, id: number) => {
    try {
      const res = await http.put(`${API.PAYABLE}/${id}`, data)
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

  const updateDetails = async (data: ReceiveProductForm) => {
    try {
      const res = await http.post(`${API.PAYABLE}/details`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

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

  return { update, updateDetails }
}
