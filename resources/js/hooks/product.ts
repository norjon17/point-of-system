import { AxiosError } from "axios"
import { API } from "../api"
import { http } from "../middleware/axiosConfig"
import { ProductFormType, ReceiveProductForm } from "../types/formTypes"
import { handleErrorMessage } from "./errorNoti"

export const useProduct = () => {
  const addProduct = async (data: ProductFormType) => {
    try {
      await http.post(`${API.PRODUCT}/add`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateProduct = async (data: ProductFormType) => {
    try {
      await http.post(`${API.PRODUCT}/update/${data.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const receiveProduct = async (data: ReceiveProductForm) => {
    try {
      await http.post(`${API.PRODUCT}/receive`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }

  return { addProduct, receiveProduct, updateProduct }
}
