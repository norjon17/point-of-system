import { ColumnDef } from "@tanstack/react-table";
import { CustomerType } from "../../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../../components/TanStackMantine/TanStackMantineCPag";
import { formatNumberWithCommas } from "../../../utils/number/formatNumberWithCommas";
import { useCustomer } from "../../../hooks/customers";
import { Group, Text } from "@mantine/core";
import AddEditCustomer from "../../../components/customer/AddEditCustomer";
import { useAuth } from "../../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../../routes";
// import { ActionIcon } from "@mantine/core";
// import { MdEdit } from "react-icons/md";

export default function Customers() {
    const { userData: user } = useAuth();

    const { customers, customersLoading, filterData, setFilterData } =
        useCustomer({ enableCustomer: true });

    const columns: ColumnDef<CustomerType>[] = [
        {
            header: "Company",
            cell: ({ cell }) => {
                return (
                    <Text
                        c={cell.row.original.active !== 1 ? "red" : undefined}
                        style={{
                            textDecoration:
                                cell.row.original.active !== 1
                                    ? "line-through"
                                    : undefined,
                        }}
                    >
                        {cell.row.original.company}
                    </Text>
                );
            },
            id: "company",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Contact Person",
            cell: ({ cell }) => {
                return cell.row.original.contact_person;
            },
            id: "contact_person",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Delivery Address",
            cell: ({ cell }) => {
                return cell.row.original.address;
            },
            id: "address",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Total Balance",
            cell: ({ cell }) => {
                return formatNumberWithCommas(cell.row.original.total_balance);
            },
            id: "total_balance",
            meta: {
                sorting: false,
            },
        },

        {
            header: "Action",
            cell: ({ cell }) => {
                return (
                    <Group>
                        <AddEditCustomer
                            type="edit"
                            customer={cell.row.original}
                        />
                    </Group>
                );
            },
            id: "action",
            meta: {
                sorting: false,
            },
            enableHiding: user.access_admin?.update !== 1,
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

    const navigate = useNavigate();
    useEffect(() => {
        //casher, sale, checker don't have access on this
        if (user && user.access_admin?.read !== 1) {
            navigate(LINKS.ACCESS_DENY);
        }
    }, [user]);

    return (
        <>
            <TanStackMantineCPag
                columns={columns}
                rows={customers ? customers.data : []}
                paginate={customers ?? null}
                highlightOnHover
                loading={customersLoading}
                toolbar={{
                    title: `Customers`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditCustomer type="add" />
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
