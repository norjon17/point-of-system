import { ActionIcon, Modal, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { CiViewTable } from "react-icons/ci"
import TanStackMantine from "../TanStackMantine/TanStackMantine"
import { ColumnDef } from "@tanstack/react-table"
import { CashTransactionType } from "../../types"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import moment from "moment"
import { usePayables } from "../../hooks/payables"

interface IProps {
  receive_id: number
}

export default function PayableHistoryLists({ receive_id }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const { paymentHistory, paymentHistoryLoading } = usePayables({
    enablePaymentHistory: opened,
    receive_id,
  })

  const handleClose = () => {
    close()
  }

  const columns: ColumnDef<CashTransactionType>[] = [
    {
      header: "Mode",
      id: "mode",
      cell: ({ row }) => {
        return row.original.type.type ?? ""
      },
    },
    // {
    //   header: "GCash Ref",
    //   id: "gcash_ref",
    //   accessorKey: "gcash_ref",
    // },
    {
      header: "Amount",
      id: "amount",
      cell: ({ row }) => {
        return formatNumberWithCommas(row.original.amount)
      },
      meta: {
        align: "right",
      },
    },
    {
      header: "Last update",
      id: "updated_at",
      cell: ({ row }) => {
        return moment(row.original.updated_at).format("MMMM DD, YYYY hh:mm A")
      },
    },
  ]

  return (
    <>
      <Tooltip label="Payment Histories">
        <ActionIcon onClick={open} radius={"lg"} color="gray">
          <CiViewTable size={20} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={handleClose}
        title="Payment Histories"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <TanStackMantine
          rows={paymentHistory ?? []}
          columns={columns}
          loading={paymentHistoryLoading}
        />
      </Modal>
    </>
  )
}
