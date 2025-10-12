import { ColumnDef } from "@tanstack/react-table";
import { ProductCategoryType } from "../../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../../components/TanStackMantine/TanStackMantineCPag";
import { Group, Text } from "@mantine/core";
import AddEditCategory from "../../../components/category/AddEditCategory";
import { useCategories } from "../../../hooks/categories";
import CategorySub from "../../../components/category/CategorySub";
import { useAuth } from "../../../hooks/auth";
import { useNavigate } from "react-router";
import { LINKS } from "../../../routes";
import { useEffect } from "react";
// import { ActionIcon } from "@mantine/core";
// import { MdEdit } from "react-icons/md";

export default function Categories() {
    const { userData: user } = useAuth();

    const { categories, categoriesLoading, filterData, setFilterData } =
        useCategories({ enableCategories: true });

    const columns: ColumnDef<ProductCategoryType>[] = [
        {
            header: "Category",
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
            id: "company",
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
                const cat = cell.row.original;
                return (
                    <Group>
                        <AddEditCategory type="edit" category={cat} />
                        <CategorySub cat_id={cat.id} cat_name={cat.name} />
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
                rows={categories ? categories.data : []}
                paginate={categories ?? null}
                highlightOnHover
                loading={categoriesLoading}
                toolbar={{
                    title: `Product Categories`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditCategory type="add" />
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
