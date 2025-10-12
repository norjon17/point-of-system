import { ColumnDef } from "@tanstack/react-table";
import { ReceivableType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { useReceivables } from "../../hooks/receivables";
import { ActionIcon, Group } from "@mantine/core";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import ReceivablesSaleUpdate from "../../components/receivables/ReceivablesSaleUpdate";
import moment from "moment";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";
import ReceivableLists from "../../components/receivables/ReceivableLists";

export default function Receivables() {
    const { userData: user } = useAuth();
    const navigate = useNavigate();
    const { transactions, transactionsLoading, filterData, setFilterData } =
        useReceivables({ enableReceivable: true });

    const [selectedReceivable, setSelectedReceivable] =
        useState<ReceivableType | null>(null);

    // const getBalance = (total?: number, received?: number) => {
    //   const receive = received ? received : 0
    //   const balance = total ? total : 0

    //   const remaining = balance - receive

    //   return remaining < 0 ? 0 : remaining
    // }
    const columns: ColumnDef<ReceivableType>[] = [
        {
            header: "Customer",
            cell: ({ cell }) => {
                return cell.row.original.sale?.customer?.company;
            },
            id: "customer",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Status",
            cell: ({ cell }) => {
                return cell.row.original.status?.name;
            },
            id: "status",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Total ₱",
            cell: ({ row }) => {
                return formatNumberWithCommas(row.original.sale?.sub_total);
            },
            id: "total",
            meta: {
                sorting: false,
                align: "right",
            },
        },
        {
            header: "Balance ₱",
            cell: ({ row }) => {
                return formatNumberWithCommas(row.original.balance);
            },
            id: "balance",
            meta: {
                sorting: false,
                align: "right",
            },
        },
        {
            header: "Due Date",
            cell: ({ cell }) => {
                return moment(cell.row.original.payment_due_date).format(
                    "MMM. DD, YYYY"
                );
            },
            id: "due_date",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ row }) => {
                return (
                    <Group>
                        {row.original.balance > 0 &&
                            user.access_receivables?.update === 1 && (
                                <ActionIcon
                                    radius={"xl"}
                                    onClick={() => {
                                        setSelectedReceivable(row.original);
                                    }}
                                >
                                    <MdEdit size={20} />
                                </ActionIcon>
                            )}
                        <ReceivableLists sale_id={row.original.sales_id} />
                    </Group>
                );
            },
            id: "action",
            meta: {
                sorting: false,
            },
            enableHiding: user.access_receivables?.update !== 1,
        },
    ];

    const handleSearch = useDebouncedCallback((value: string) => {
        setFilterData((c) => ({
            ...c,
            page: 1,
            search: value,
        }));
    }, 500);

    const columSort = (sortData: IsSortedType | undefined) => {
        // console.log(sortData);
        setFilterData((c) => ({
            ...c,
            order_by: sortData,
        }));
    };

    useEffect(() => {
        if (user.access_receivables?.read !== 1) {
            navigate(LINKS.ACCESS_DENY);
        }
    }, [user]);

    return (
        <>
            <TanStackMantineCPag
                columns={columns}
                rows={transactions ? transactions.data : []}
                paginate={transactions ?? null}
                highlightOnHover
                loading={transactionsLoading}
                toolbar={{
                    title: `Receivables`,
                    // enableSearch: true,
                }}
                handlePageChange={(rows, page) => {
                    setFilterData((c) => ({
                        ...c,
                        rows,
                        page,
                    }));
                }}
                handleRowChange={(rows) => {
                    setFilterData((c) => ({
                        ...c,
                        page: 1,
                        rows,
                    }));
                }}
                handleSort={columSort}
                handleChange={(e) => {
                    handleSearch(e);
                }}
                initialSorting={
                    filterData.order_by ? { ...filterData.order_by } : undefined
                }
            />

            <ReceivablesSaleUpdate
                {...{ selectedReceivable, setSelectedReceivable }}
            />
        </>
    );
}
