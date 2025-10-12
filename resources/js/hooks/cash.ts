import { AxiosError } from "axios"
import { CashFormType, CashFormTypeV2 } from "../types/formTypes"
import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { notifications } from "@mantine/notifications"

export const useCash = () => {
  const cashIn = async (data: CashFormType) => {
    try {
      const res = await http.post(`${API.CASH}/cash-in`, data)

      notifications.show({
        title: "Succes",
        message: res.data,
        color: "green",
      })

      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  const cashOut = async (data: CashFormType) => {
    try {
      const res = await http.post(`${API.CASH}/cash-out`, data)

      notifications.show({
        title: "Succes",
        message: res.data,
        color: "green",
      })

      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const cashInV2 = async (data: CashFormTypeV2) => {
    try {
      const res = await http.post(`${API.CASH}/cash-in-v2`, data)

      notifications.show({
        title: "Succes",
        message: res.data,
        color: "green",
      })

      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  const cashOutV2 = async (data: CashFormTypeV2) => {
    try {
      const res = await http.post(`${API.CASH}/cash-out-v2`, data)

      notifications.show({
        title: "Succes",
        message: res.data,
        color: "green",
      })

      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return { cashIn, cashOut, cashInV2, cashOutV2 }
}
