import { ColumnDef } from "@tanstack/react-table";
import { ProductReceiveType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import moment from "moment";
import { usePayables } from "../../hooks/payables";
import PayableUpdate from "../../components/payable/PayableUpdate";
import PayableDetailsUpdate from "../../components/payable/PayableDetailsUpdate";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";
import PayableHistoryLists from "../../components/payable/PayableHistoryLists";

export default function Payables() {
    const { userData: user } = useAuth();
    const navigate = useNavigate();

    const { transactions, transactionsLoading, filterData, setFilterData } =
        usePayables({ enablePayable: true });

    const [selectedPayable, setSelectedPayable] =
        useState<ProductReceiveType | null>(null);
    const [selectedPayable1, setSelectedPayable1] =
        useState<ProductReceiveType | null>(null);

    const getBalance = (total?: number, received?: number) => {
        const receive = received ? received : 0;
        const balance = total ? total : 0;
        const remaining = balance - receive;

        return remaining < 0 ? 0 : remaining;
    };

    const columns: ColumnDef<ProductReceiveType>[] = [
        {
            header: "Product",
            cell: ({ cell }) => {
                return cell.row.original.product?.name;
            },
            id: "product",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Supplier",
            cell: ({ cell }) => {
                return cell.row.original.supplier?.company;
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
            cell: ({ cell }) => {
                return formatNumberWithCommas(cell.row.original.product_cost);
            },
            id: "product_cost",
            meta: {
                sorting: false,
                align: "right",
            },
        },
        {
            header: "Balance ₱",
            cell: ({ cell }) => {
                const t = getBalance(
                    cell.row.original.product_cost,
                    cell.row.original.amount
                );
                return formatNumberWithCommas(t);
            },
            id: "amount",
            meta: {
                sorting: false,
                align: "right",
            },
        },
        {
            header: "Due Date",
            cell: ({ row }) => {
                return moment(row.original.payable_date).format(
                    "MMM. DD, YYYY"
                );
            },
            id: "payable_date",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ row }) => {
                const t = getBalance(
                    row.original.product_cost,
                    row.original.amount
                );

                return (
                    <Group>
                        {t > 0 && user.access_payables?.update === 1 && (
                            <Tooltip label="Update payment">
                                <ActionIcon
                                    radius={"xl"}
                                    onClick={() => {
                                        setSelectedPayable(row.original);
                                    }}
                                >
                                    <MdEdit size={20} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {user.access_payables_update_details?.update === 1 && (
                            <Tooltip label="Update Details">
                                <ActionIcon
                                    radius={"xl"}
                                    onClick={() => {
                                        setSelectedPayable1(row.original);
                                    }}
                                    color="green"
                                >
                                    <MdEdit size={20} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        <PayableHistoryLists receive_id={row.original.id} />
                    </Group>
                );
            },
            id: "action",
            meta: {
                sorting: false,
            },
            enableHiding:
                user.access_payables_update_details?.update !== 1 &&
                user.access_payables?.update !== 1,
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
        if (user.access_payables?.read !== 1) {
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
                    title: `Payables`,
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

            <PayableUpdate {...{ selectedPayable, setSelectedPayable }} />
            <PayableDetailsUpdate
                selectedPayable={selectedPayable1}
                setSelectedPayable={setSelectedPayable1}
            />
        </>
    );
}
