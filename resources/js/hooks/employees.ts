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
import { APP_DEBUG, QUERY_NAME } from "../constants/constants"
import { useQuery } from "@tanstack/react-query"
import {
  EmployeeFormType,
  EmployeeLoanFormType,
  EmployeeSalaryFormType,
} from "../types/formTypes"
import { EmployeeLoanType, EmployeeSalaryType, EmployeeType } from "../types"

interface IProps {
  enableEmployees?: boolean
  enableLoans?: boolean
  enableSalaries?: boolean
  enableEmployeeDetails?: boolean
  employee_id?: number
}

export const useEmployees = ({
  enableEmployees,
  enableLoans,
  enableSalaries,
  enableEmployeeDetails,
  employee_id,
}: IProps = {}) => {
  const [filterData, setFilterData] = useState<EmployeeFilterType>({
    rows: 10,
    page: 1,
    search: "",
    order_by: {
      sort: "desc",
      id: "updated_at",
    },
  })

  const {
    data: employees,
    isLoading: employeesLoading,
    refetch: employeesRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const filter = removeWhiteSpace(
          filterData.search ? filterData.search : ""
        )

        let formData: EmployeeFilterType = {
          ...filterData,
        }

        if (filter.length > 0) {
          formData = {
            ...formData,
            search: formData.search,
          }
        }

        const res = await http.post(`${API.EMPLOYEES}/all`, formData)

        return res.data as PaginationType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [`${QUERY_NAME.EMPLOYEE}-all`, { ...filterData }],
    enabled: enableEmployees,
  })

  const {
    data: employeeLoans,
    isLoading: employeeLoansLoading,
    refetch: employeeLoansRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.EMPLOYEES}/loan/all/${employee_id}`)
        return res.data as EmployeeLoanType[]
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return []
      }
    },
    queryKey: [
      `${QUERY_NAME.EMPLOYEE}-loans-all`,
      { enableLoans, employee_id },
    ],
    enabled: enableLoans && employee_id ? true : false,
  })

  const {
    data: employeeSalaries,
    isLoading: employeeSalariesLoading,
    refetch: employeeSalariesRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.EMPLOYEES}/salary/all/${employee_id}`)
        if (APP_DEBUG) {
          console.log(res.data)
        }
        return res.data as EmployeeSalaryType[]
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return []
      }
    },
    queryKey: [
      `${QUERY_NAME.EMPLOYEE}-salary-all`,
      { enableSalaries, employee_id },
    ],
    enabled: enableSalaries && employee_id ? true : false,
  })
  const {
    data: employeeDetails,
    isLoading: employeeDetailsLoading,
    refetch: employeeDetailsRefetch,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await http.get(`${API.EMPLOYEES}/${employee_id}`)
        return res.data as EmployeeType
      } catch (e) {
        const error = e as AxiosError
        handleErrorMessage(error)
        return null
      }
    },
    queryKey: [
      `${QUERY_NAME.EMPLOYEE}-employee-details`,
      { enableEmployeeDetails, employee_id },
    ],
    enabled: enableEmployeeDetails && employee_id ? true : false,
  })

  const addEmployee = async (data: EmployeeFormType) => {
    try {
      await http.post(`${API.EMPLOYEES}`, data, {
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
  const updateEmployee = async (data: EmployeeFormType) => {
    try {
      await http.put(`${API.EMPLOYEES}/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const insertLoan = async (data: EmployeeLoanFormType) => {
    try {
      await http.post(`${API.EMPLOYEES}/loan`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const updateLoan = async (data: EmployeeLoanFormType) => {
    try {
      await http.put(`${API.EMPLOYEES}/loan/${data.id}`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  const insertSalary = async (data: EmployeeSalaryFormType) => {
    try {
      await http.post(`${API.EMPLOYEES}/salary`, data)
      return true
    } catch (e) {
      const error = e as AxiosError
      handleErrorMessage(error)
      return false
    }
  }
  // const updateSalary = async (data: EmployeeSalaryFormType) => {
  //   try {
  //     await http.put(`${API.EMPLOYEES}/salary/${data.id}`, data)
  //     return true
  //   } catch (e) {
  //     const error = e as AxiosError
  //     handleErrorMessage(error)
  //     return false
  //   }
  // }

  return {
    employees,
    employeesLoading,
    employeesRefetch,
    filterData,
    setFilterData,
    addEmployee,
    updateEmployee,
    employeeLoans,
    employeeLoansLoading,
    employeeLoansRefetch,
    insertLoan,
    updateLoan,
    employeeSalaries,
    employeeSalariesLoading,
    employeeSalariesRefetch,
    insertSalary,
    // updateSalary,
    employeeDetails,
    employeeDetailsLoading,
    employeeDetailsRefetch,
  }
}

export type EmployeeFilterType = {
  rows: number
  page: number
  search?: string
  order_by?: IsSortedType
}
