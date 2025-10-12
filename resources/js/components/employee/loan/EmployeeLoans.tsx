import { ActionIcon, Group, Modal, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEmployees } from "../../../hooks/employees"
import { FaPesoSign } from "react-icons/fa6"
import TanStackMantine from "../../TanStackMantine/TanStackMantine"
import { ColumnDef } from "@tanstack/react-table"
import { EmployeeLoanType } from "../../../types"
import { formatNumberWithCommas } from "../../../utils/number/formatNumberWithCommas"
import moment from "moment"
import AddLoan from "./AddLoan"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { PaginationType } from "../../TanStackMantine/TanStackMantineCPag"

interface IProps {
  employee_id: number
  name: string
  employeesRefetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<PaginationType | null, Error>>
}
export default function EmployeeLoans({
  employee_id,
  name,
  employeesRefetch,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const { employeeLoans, employeeLoansLoading, employeeLoansRefetch } =
    useEmployees({
      enableLoans: opened,
      employee_id,
    })

  const columns: ColumnDef<EmployeeLoanType>[] = [
    {
      header: "Amount",
      accessorKey: "amount",
      id: "amount",
      cell: ({ row }) => {
        return formatNumberWithCommas(row.original.amount)
      },
      meta: {
        align: "right",
      },
    },
    {
      header: "Details",
      accessorKey: "details",
      id: "amount",
    },
    {
      header: "Last Updated",
      cell: ({ row }) => {
        return moment(row.original.created_at).format("MMM. DD, YYYY hh:mm A")
      },
      id: "updated_at",
    },
    // {
    //   header: "Action",
    //   cell: ({ row }) => {
    //     return (
    //       <Group>
    //         <AddLoan
    //           loan={row.original}
    //           employee_id={employee_id}
    //           type="edit"
    //           {...{ employeeLoansRefetch }}
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
      <Tooltip label="Loans">
        <ActionIcon color="green.9" onClick={open} radius={"lg"}>
          <FaPesoSign size={18} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={handleClose}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <TanStackMantine
          columns={columns}
          rows={employeeLoans ?? []}
          toolbar={{
            title: `${name}'s Loan(s)`,
            action: (
              <Group>
                <AddLoan
                  employee_id={employee_id}
                  type="add"
                  {...{ employeeLoansRefetch }}
                />
              </Group>
            ),
          }}
          loading={employeeLoansLoading}
        />
      </Modal>
    </>
  )
}
