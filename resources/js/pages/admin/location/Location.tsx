import { ColumnDef } from "@tanstack/react-table";
import { ProductLocationType } from "../../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../../components/TanStackMantine/TanStackMantineCPag";
import { Group, Text } from "@mantine/core";
import { useLocation } from "../../../hooks/location";
import AddEditLocation from "../../../components/admin/location/AddEditLocation";
import { useAuth } from "../../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../../routes";
// import { ActionIcon } from "@mantine/core";
// import { MdEdit } from "react-icons/md";

export default function Location() {
    const { userData: user } = useAuth();
    const { locations, locationsLoading, filterData, setFilterData } =
        useLocation({
            enableLocation: true,
        });

    const columns: ColumnDef<ProductLocationType>[] = [
        {
            header: "Name",
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
            header: "Description",
            cell: ({ cell }) => {
                return cell.row.original.description;
            },
            id: "description",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ cell }) => {
                return (
                    <Group>
                        <AddEditLocation
                            type="edit"
                            location={cell.row.original}
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
        //admin only
        if (user && user.access_admin?.read !== 1) {
            navigate(LINKS.ACCESS_DENY);
        }
    }, [user]);

    return (
        <>
            <TanStackMantineCPag
                columns={columns}
                rows={locations ? locations.data : []}
                paginate={locations ?? null}
                highlightOnHover
                loading={locationsLoading}
                toolbar={{
                    title: `Supplier`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditLocation type="add" />
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
