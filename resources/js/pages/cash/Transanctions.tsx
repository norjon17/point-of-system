import { ColumnDef } from "@tanstack/react-table";
import { useCashTransactions } from "../../hooks/cashTransactions";
import { CashTransactionType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { Group } from "@mantine/core";
import CashInOutV2 from "../../components/cash/CashInOutV2";
import CashTurnover from "../../components/turnover/CashTurnover";
import { LINKS } from "../../routes";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/auth";

export default function Transanctions() {
    const {
        transactions,
        transactionsLoading,
        filterData,
        setFilterData,
        totalCash,
    } = useCashTransactions({ enableCashTransactions: true });

    // const [columns, setColumns] = useState<ColumnDef<CashTransactionType>[]>([

    // ])
    const columns: ColumnDef<CashTransactionType>[] = [
        {
            header: "User",
            cell: ({ cell }) => {
                return cell.row.original.user.name;
            },
            id: "user",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Transaction",
            cell: ({ cell }) => {
                return cell.row.original.type.type;
            },
            id: "type",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Details",
            accessorKey: "details",
            id: "details",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Name",
            accessorKey: "name",
            id: "name",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Amount ₱",
            cell: ({ cell }) => {
                return `${formatNumberWithCommas(cell.row.original.amount)}`;
            },
            id: "amount",
            meta: {
                sorting: false,
                align: "right",
            },
        },
        {
            header: "Last Transaction",
            accessorKey: "last_transaction",
            id: "last_transaction",
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

    const { userData: user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (user.access_cashier?.read !== 1) {
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
                    title: `Cashier`,
                    subTitle: `Total Cash: ₱ ${formatNumberWithCommas(
                        totalCash
                    )}`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_cashier_in?.create === 1 && (
                                <CashInOutV2 type="in" />
                            )}
                            {user.access_cashier_out?.create === 1 && (
                                <CashInOutV2 type="out" />
                            )}
                            {user.access_cashier_turnover?.create === 1 && (
                                <CashTurnover />
                            )}
                        </Group>
                    ),
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
        </>
    );
}
