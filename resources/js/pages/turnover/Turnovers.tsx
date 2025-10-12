import { ColumnDef } from "@tanstack/react-table";
import { TurnoverType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { useTurnovers } from "../../hooks/turnovers";
import moment from "moment";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../routes";

export default function Turnovers() {
    const { transactions, transactionsLoading, filterData, setFilterData } =
        useTurnovers({ enableTurnovers: true });

    // const [columns, setColumns] = useState<ColumnDef<CashTransactionType>[]>([

    // ])
    const columns: ColumnDef<TurnoverType>[] = [
        {
            header: "Turnover from",
            cell: ({ cell }) => {
                return cell.row.original.turnover_from?.name;
            },
            id: "user",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Amount",
            cell: ({ cell }) => {
                return formatNumberWithCommas(cell.row.original.amount);
            },
            id: "amount",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Accepted by",
            cell: ({ cell }) => {
                return cell.row.original.accepted_by?.name;
            },
            id: "accepted_by",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Last Transaction",
            cell: ({ cell }) => {
                return moment(cell.row.original.updated_at).format(
                    "MMM. DD, YYYY hh:mm A"
                );
            },
            id: "updated_at",
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
        //checker, sale, don't have access on this
        if (user.access_cashier_turnover_logs?.read !== 1) {
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
                    title: `Turnover Logs`,
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
