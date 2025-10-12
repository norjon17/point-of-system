import { ColumnDef } from "@tanstack/react-table";
import { SalesType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { useSales } from "../../hooks/sales";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import moment from "moment";
import { ActionIcon, Group } from "@mantine/core";
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import SalesDeliveryEdit from "../../components/sales/SalesDeliveryEdit";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";
import SalesReprint from "../../components/sales/SalesReprint";

export default function Sales() {
    const { userData: user } = useAuth();
    const navigate = useNavigate();

    const { transactions, transactionsLoading, filterData, setFilterData } =
        useSales({ enableSales: true });

    const [selectedSale, setSelectedSale] = useState<SalesType | null>(null);

    const columns: ColumnDef<SalesType>[] = [
        {
            header: "Customer",
            cell: ({ cell }) => {
                return cell.row.original.customer?.company;
            },
            id: "customer",
            meta: {
                sorting: false,
            },
        },
        // {
        //   header: "Mode",
        //   cell: ({ cell }) => {
        //     return cell.row.original.payment_mode?.name
        //   },
        //   id: "mode",
        //   meta: {
        //     sorting: false,
        //   },
        // },
        {
            header: "Type",
            cell: ({ cell }) => {
                return cell.row.original.order_type?.name;
            },
            id: "type",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Delivery Status",
            cell: ({ cell }) => {
                return cell.row.original.delivery_status?.name;
            },
            id: "delivery_status",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Total ₱",
            cell: ({ row }) => {
                return formatNumberWithCommas(row.original.sub_total);
            },
            id: "sub_total",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Received ₱",
            cell: ({ row }) => {
                return formatNumberWithCommas(row.original.received);
            },
            id: "received",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Last Update",
            cell: ({ cell }) => {
                return moment(cell.row.original.updated_at).format(
                    "MMM. DD, YYYY hh:mm A"
                );
            },
            id: "updated_at",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ row }) => {
                //if order type is Delivery , show edit button
                return (
                    <Group>
                        {user.access_sales_lists?.read === 1 && (
                            <SalesReprint sales_id={row.original.id} />
                        )}
                        {row.original.order_type?.id === 2 &&
                            user.access_sales_lists?.update === 1 && (
                                <ActionIcon
                                    radius={"xl"}
                                    onClick={() => {
                                        setSelectedSale(row.original);
                                    }}
                                >
                                    <MdEdit size={20} />
                                </ActionIcon>
                            )}
                    </Group>
                );
            },
            id: "action",
            meta: {
                sorting: false,
            },
            enableHiding: user.access_sales_lists?.update !== 1,
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
        //sale, don't have access on this
        if (user.access_sales_lists?.read !== 1) {
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
                    title: `Sales`,
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

            <SalesDeliveryEdit {...{ selectedSale, setSelectedSale }} />
        </>
    );
}
