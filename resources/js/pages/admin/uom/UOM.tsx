import { ColumnDef } from "@tanstack/react-table";
import { ProductUOMType } from "../../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../../components/TanStackMantine/TanStackMantineCPag";
import { Group, Text } from "@mantine/core";
import { useUOM } from "../../../hooks/uom";
import AddEditUOM from "../../../components/admin/uom/AddEditUOM";
import { useAuth } from "../../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../../routes";
// import { ActionIcon } from "@mantine/core";
// import { MdEdit } from "react-icons/md";

export default function UOM() {
    const { userData: user } = useAuth();

    const { uoms, uomsLoading, filterData, setFilterData } = useUOM({
        enableUOM: true,
    });

    const columns: ColumnDef<ProductUOMType>[] = [
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
            header: "Abbreviation",
            cell: ({ cell }) => {
                return cell.row.original.abbr;
            },
            id: "abbreviation",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ cell }) => {
                return (
                    <Group>
                        <AddEditUOM type="edit" uom={cell.row.original} />
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
                rows={uoms ? uoms.data : []}
                paginate={uoms ?? null}
                highlightOnHover
                loading={uomsLoading}
                toolbar={{
                    title: `Unit of Measures`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditUOM type="add" />
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
