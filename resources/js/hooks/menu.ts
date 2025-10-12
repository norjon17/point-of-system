import { AxiosError } from "axios"
import { API } from "../api"
import { QUERY_NAME } from "../constants/constants"
import { http } from "../middleware/axiosConfig"
import {
  CustomerType,
  DeliveryStatusType,
  EmployeeType,
  ProductCategoryType,
  ProductLocationType,
  ProductType,
  ProductUOMType,
  ReceivableType,
  SupplierType,
  UserAccessType,
  UserType,
  VehicleType,
} from "../types"
import { handleErrorMessage } from "./errorNoti"
import { useQuery } from "@tanstack/react-query"

interface IProps {
  enableProductMenu?: boolean
  enableProductListMenu?: boolean
  enablePOSMenu?: boolean
  enableDeliveryMenu?: boolean
  // enableUsersMenu?: boolean
  enableCashMenu?: boolean
}

export const useMenu = ({
  enableProductMenu,
  enableProductListMenu,
  enablePOSMenu,
  enableDeliveryMenu,
  // enableUsersMenu,
  enableCashMenu,
}: IProps = {}) => {
  const { data: productMenu, isLoading: productMenuLoading } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.MENU}/product`)
        return res.data as ProductMenuType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return {
          locations: [],
          categories: [],
          uom: [],
        } as ProductMenuType
      }
    },
    queryKey: [`${QUERY_NAME.MENU}-productMenu`],
    enabled: enableProductMenu,
  })
  const { data: productListMenu, isLoading: productListMenuLoading } =
    useQuery<ProductListMenuType>({
      queryFn: async () => {
        try {
          const res = await http.get(`${API.MENU}/product-list`)
          return res.data as ProductListMenuType
        } catch (e) {
          const error = e as AxiosError
          handleErrorMessage(error)
          return {
            products: [],
            suppliers: [],
            users: [],
          }
        }
      },
      queryKey: [`${QUERY_NAME.MENU}-product-list-menu`],
      enabled: enableProductListMenu,
    })
  const { data: posMenu, isLoading: posMenuLoading } = useQuery<POSMenuType>({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.MENU}/pos`)
        return res.data as POSMenuType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return {
          customers: [],
          modes: [],
        }
      }
    },
    queryKey: [`${QUERY_NAME.MENU}-pos-menu`],
    enabled: enablePOSMenu,
  })
  const { data: deliveryMenu, isLoading: deliveryMenuLoading } =
    useQuery<DeliverMenuType>({
      queryFn: async () => {
        try {
          const res = await http.get(`${API.MENU}/delivery`)
          return res.data as DeliverMenuType
        } catch (e) {
          const error = e as AxiosError
          handleErrorMessage(error)
          return {
            users: [],
            vehicles: [],
            delivery_statuses: [],
          }
        }
      },
      queryKey: [`${QUERY_NAME.MENU}-delivery-menu`],
      enabled: enableDeliveryMenu,
    })
  // const { data: usersMenu, isLoading: usersMenuLoading } =
  //   useQuery<UsersMenuType>({
  //     queryFn: async () => {
  //       try {
  //         const res = await http.get(`${API.MENU}/users`)
  //         return res.data as UsersMenuType
  //       } catch (e) {
  //         const error = e as AxiosError
  //         handleErrorMessage(error)
  //         return {
  //           accesses: [],
  //         }
  //       }
  //     },
  //     queryKey: [`${QUERY_NAME.MENU}-users-menu`],
  //     enabled: enableUsersMenu,
  //   })
  const { data: cashMenu, isLoading: cashMenuLoading } = useQuery<CashMenuType>(
    {
      queryFn: async () => {
        try {
          const res = await http.get(`${API.MENU}/cash`)
          return res.data as CashMenuType
        } catch (e) {
          const error = e as AxiosError
          handleErrorMessage(error)
          return {
            employees: [],
          }
        }
      },
      queryKey: [`${QUERY_NAME.MENU}-cash-menu`],
      enabled: enableCashMenu,
    }
  )

  return {
    productMenu,
    productMenuLoading,
    productListMenu,
    productListMenuLoading,
    posMenu,
    posMenuLoading,
    deliveryMenu,
    deliveryMenuLoading,
    // usersMenu,
    // usersMenuLoading,
    cashMenu,
    cashMenuLoading,
  }
}

type ProductMenuType = {
  locations: ProductLocationType[]
  categories: ProductCategoryType[]
  uom: ProductUOMType[]
}
type ProductListMenuType = {
  products: ProductType[]
  suppliers: SupplierType[]
  users: UserType[]
}
export type POSMenuType = {
  customers: CustomerType[]
  modes: ReceivableType[]
}
export type DeliverMenuType = {
  users: UserType[]
  vehicles: VehicleType[]
  delivery_statuses: DeliveryStatusType[]
}
export type UsersMenuType = {
  accesses: UserAccessType[]
}
export type CashMenuType = {
  employees: EmployeeType[]
}
