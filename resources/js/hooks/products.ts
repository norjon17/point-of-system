import { useState } from "react"
import {
  IsSortedType,
  PaginationType,
} from "../components/TanStackMantine/TanStackMantineCPag"
import { removeWhiteSpace } from "../utils/string/removeWhiteSpace"
import { http } from "../middleware/axiosConfig"
import { API } from "../api"
import { AxiosError } from "axios"
import { handleErrorMessage } from "./errorNoti"
import { QUERY_NAME } from "../constants/constants"
import { useQuery } from "@tanstack/react-query"
import { POSOrderType } from "../types/formTypes"

interface IProps {
  enableProducts?: boolean
  enableBarcodeProd?: boolean
  barcodeSearch?: string
}

export const useProducts = ({
  enableProducts,
  enableBarcodeProd,
  barcodeSearch,
}: IProps = {}) => {
  const [filterData, setFilterData] = useState<ProductFilterType>({
    rows: 10,
    page: 1,
    search: "",
    // order_by: {
    //   sort: "desc",
    //   id: "last_transaction",
    // },
  })

  const {
    data: products,
    isLoading: productsLoading,
    refetch: productsRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: ProductFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.PRODUCT}/lists`, formData)
        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.PRODUCT}`, { ...filterData }],
    enabled: enableProducts,
  })

  const {
    data: productsBC,
    isLoading: productsBCLoading,
    refetch: productsBCRefetch,
    isRefetching: productsBCRefetchLoading,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.post(`${API.PRODUCT}/barcode`, {
          search: barcodeSearch,
        })
        return res.data as POSOrderType[]
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return []
      }
    },
    queryKey: [`${QUERY_NAME.PRODUCT}`, barcodeSearch],
    enabled: enableBarcodeProd,
  })

  return {
    products,
    productsLoading,
    productsRefetch,
    filterData,
    setFilterData,
    productsBC,
    productsBCLoading,
    productsBCRefetch,
    productsBCRefetchLoading,
  }
}

export type ProductFilterType = {
  rows: number
  page: number
  search?: string
  order_by?: IsSortedType | null
}
