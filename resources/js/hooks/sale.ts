import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { DeliverUpdateFormType, POSFormType } from "../types/formTypes"
import { notifications } from "@mantine/notifications"

export const useSale = () => {
  const receiveOrder = async (data: POSFormType) => {
    try {
      const res = await http.post(`${API.SALE}`, data)

      const tdata = res.data as ReceiveOrderType
      notifications.show({
        title: "Success",
        message: tdata.message as string,
        color: "green",
      })

      return tdata.id as number
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return null
    }
  }

  const updateDeliveryStatus = async (
    data: DeliverUpdateFormType,
    id: number
  ) => {
    try {
      const res = await http.put(`${API.SALE}/delivery/${id}`, data)
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

  return { receiveOrder, updateDeliveryStatus }
}

type ReceiveOrderType = {
  id: number
  message: string
}
