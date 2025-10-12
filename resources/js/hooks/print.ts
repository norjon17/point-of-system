import { handleErrorMessage } from "./errorNoti"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { AxiosError } from "axios"

export const usePrint = () => {
  const print = async (sales_id: number) => {
    try {
      const res = await http.get(`${API.PRINT}/${sales_id}`)

      return res.data as string
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return null
    }
  }

  return { print }
}
