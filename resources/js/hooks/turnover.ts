import { AxiosError, AxiosResponse } from "axios"
import { TurnoverFormType } from "../types/formTypes"
import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { notifications } from "@mantine/notifications"
import { TurnoverType } from "../types"

export const useTurnover = () => {
  const turnover = async (data: TurnoverFormType) => {
    try {
      const res = await http.post(API.TURNOVER, data)

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
  const getTurnover = async (id?: number) => {
    try {
      let res: AxiosResponse<any, any>
      if (id) {
        res = await http.get(`${API.TURNOVER}/${id}`)
      } else {
        res = await http.get(API.TURNOVER)
      }

      const data = res.data as TurnoverType

      if (Object.keys(data).length === 0) {
        return null
      }

      return data
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return null
    }
  }
  const acceptTurnover = async (id: number) => {
    try {
      const res = await http.put(`${API.TURNOVER}/${id}`)
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

  return { turnover, getTurnover, acceptTurnover }
}
