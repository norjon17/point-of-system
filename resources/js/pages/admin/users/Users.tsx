import { ColumnDef } from "@tanstack/react-table";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../../components/TanStackMantine/TanStackMantineCPag";
import { Group, Text } from "@mantine/core";
import { UserType } from "../../../types";
import { useUsers } from "../../../hooks/users";
import AddEditUser from "../../../components/users/AddEditUsers";
import { useAuth } from "../../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../../routes";
import UserAccessUpdate from "../../../components/admin/access/UserAccessUpdate";

export default function Users() {
    const { userData: user } = useAuth();

    const { users, usersLoading, filterData, setFilterData } = useUsers({
        enableUsers: true,
    });

    // const [columns, setColumns] = useState<ColumnDef<CashTransactionType>[]>([

    // ])
    const columns: ColumnDef<UserType>[] = [
        {
            header: "First Name",
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
                        {cell.row.original.name}
                    </Text>
                );
            },
            id: "name",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Last Name",
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
                        {cell.row.original.lname}
                    </Text>
                );
            },
            id: "lname",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Username",
            cell: ({ cell }) => {
                return cell.row.original.username;
            },
            id: "username",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ cell }) => {
                return (
                    <Group>
                        {user.access_admin?.update === 1 && (
                            <AddEditUser type="edit" user={cell.row.original} />
                        )}
                        {user.access_admin_access_update?.update === 1 && (
                            <UserAccessUpdate user={cell.row.original} />
                        )}
                    </Group>
                );
            },
            id: "action",
            meta: {
                sorting: false,
            },
            enableHiding:
                user.access_admin?.update !== 1 &&
                user.access_admin_access_update?.update !== 1,
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
                rows={users ? users.data : []}
                paginate={users ?? null}
                highlightOnHover
                loading={usersLoading}
                toolbar={{
                    title: `Users`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditUser type="add" />
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
