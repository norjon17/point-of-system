import { useDisclosure } from "@mantine/hooks"
import { useEmployees } from "../../../hooks/employees"
import { ColumnDef } from "@tanstack/react-table"
import { EmployeeSalaryType } from "../../../types"
import { formatNumberWithCommas } from "../../../utils/number/formatNumberWithCommas"
import moment from "moment"
import { ActionIcon, Group, Modal, Tooltip } from "@mantine/core"
import TanStackMantine from "../../TanStackMantine/TanStackMantine"
import { FaHandHoldingUsd } from "react-icons/fa"
import AddSalary from "./AddSalary"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { PaginationType } from "../../TanStackMantine/TanStackMantineCPag"

interface IProps {
  employee_id: number
  employeesRefetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<PaginationType | null, Error>>
}
export default function EmployeeSalary({
  employee_id,
  employeesRefetch,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const {
    employeeSalaries,
    employeeSalariesLoading,
    employeeSalariesRefetch,
    employeeDetails,
    employeeDetailsRefetch,
  } = useEmployees({
    enableSalaries: opened,
    enableEmployeeDetails: opened,
    employee_id: employee_id,
  })

  const columns: ColumnDef<EmployeeSalaryType>[] = [
    {
      header: "Salary Earned",
      accessorKey: "salary",
      id: "salary",
      cell: ({ row }) => {
        return formatNumberWithCommas(row.original.salary)
      },
      meta: {
        align: "right",
      },
    },
    {
      header: "Daily Rate",
      accessorKey: "salary",
      id: "salary",
      cell: ({ row }) => {
        return formatNumberWithCommas(row.original.daily_salary)
      },
      meta: {
        align: "right",
      },
    },
    {
      header: "Days Worked",
      accessorKey: "days",
      id: "days",
      meta: {
        align: "right",
      },
    },
    {
      header: "Loan Paid",
      accessorKey: "loan_paid",
      id: "loan_paid",
      cell: ({ row }) => {
        return formatNumberWithCommas(row.original.loan_paid)
      },
      meta: {
        align: "right",
      },
    },
    {
      header: "Salary Date",
      cell: ({ row }) => {
        return row.original.date_salary
          ? moment(row.original.date_salary).format("MMM. DD, YYYY hh:mm A")
          : ""
      },
      id: "updated_at",
    },
    // {
    //   header: "Action",
    //   cell: ({ row }) => {
    //     return (
    //       <Group>
    //         <AddSalary
    //           salary={row.original as unknown as EmployeeSalaryFormType}
    //           type="edit"
    //           employee={employee}
    //         />
    //       </Group>
    //     )
    //   },
    // },
  ]

  const handleClose = async () => {
    close()
    await employeesRefetch()
  }

  return (
    <>
      <Tooltip label="Salaries">
        <ActionIcon color="lime.9" onClick={open} radius={"lg"}>
          <FaHandHoldingUsd size={18} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={handleClose}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"xl"}
      >
        <TanStackMantine
          columns={columns}
          rows={employeeSalaries ?? []}
          toolbar={{
            title: `${employeeDetails?.name}'s Salaries`,
            action: (
              <Group>
                {employeeDetails && (
                  <AddSalary
                    type="add"
                    {...{ employeeSalariesRefetch, employeeDetailsRefetch }}
                    employee={employeeDetails}
                  />
                )}
              </Group>
            ),
          }}
          loading={employeeSalariesLoading}
        />
      </Modal>
    </>
  )
}
