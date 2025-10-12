import { ColumnDef } from "@tanstack/react-table";
import { ProductType } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { useProducts } from "../../hooks/products";
import { Group, Image } from "@mantine/core";
import AddProduct from "../../components/products/AddProduct";
import { CURRENTLINK } from "../../constants/constants";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import ReceiveProduct from "../../components/products/ReceiveProduct";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../routes";
import { ProductFormType } from "../../types/formTypes";

export default function Products() {
    const { userData: user } = useAuth();
    const navigate = useNavigate();

    const {
        products,
        productsLoading,
        filterData,
        setFilterData,
        productsRefetch,
    } = useProducts({
        enableProducts: true,
    });

    // const [columns, setColumns] = useState<ColumnDef<CashTransactionType>[]>([

    // ])
    const columns: ColumnDef<ProductType>[] = [
        {
            header: "Name",
            accessorKey: "name",
            meta: {
                sorting: false,
            },
            id: "name",
        },
        {
            header: "Image",
            cell: ({ cell }) => {
                const imagePath = cell.row.original.image_path_name;
                return imagePath ? (
                    <Group justify="center">
                        <Image
                            alt={cell.row.original.image_original_name}
                            // src={`${CURRENTLINK}/backend/storage/${imagePath}?t=${Date.now()}`}
                            src={`/storage/${imagePath}`}
                            h={50}
                            style={{ objectFit: "contain" }}
                        />
                    </Group>
                ) : (
                    <></>
                );
            },
            meta: {
                sorting: false,
            },
            id: "image",
        },
        {
            header: "Barcode",
            accessorKey: "barcode",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Product Cost ₱",
            cell: ({ cell }) => {
                return `${formatNumberWithCommas(
                    cell.row.original.product_cost
                )}`;
            },
            meta: {
                sorting: false,
                align: "right",
            },
            id: "product_cost",
        },
        {
            header: "Selling Price ₱",
            cell: ({ cell }) => {
                return `${formatNumberWithCommas(
                    cell.row.original.selling_price
                )}`;
            },
            meta: {
                sorting: false,
                align: "right",
            },
            id: "selling_price",
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            meta: {
                sorting: false,
                align: "right",
            },
            id: "quantity",
        },
        {
            header: "Action",
            id: "action",
            meta: { sorting: false },
            enableHiding: user.access_products?.update !== 1,
            cell: ({ cell }) => {
                return (
                    <Group>
                        {user.access_products?.update === 1 && (
                            <AddProduct
                                product={
                                    cell.row
                                        .original as unknown as ProductFormType
                                }
                                onRefetch={handleRefetch}
                            />
                        )}
                    </Group>
                );
            },
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
        if (user.access_products?.read !== 1) {
            navigate(LINKS.ACCESS_DENY);
        }
    }, [user]);

    const handleRefetch = async () => {
        await productsRefetch();
    };

    return (
        <>
            <TanStackMantineCPag
                columns={columns}
                rows={products ? products.data : []}
                paginate={products ?? null}
                highlightOnHover
                loading={productsLoading}
                toolbar={{
                    title: `Products`,
                    enableSearch: true,
                    action: (
                        <Group>
                            {user.access_products_receive?.update === 1 && (
                                <ReceiveProduct />
                            )}
                            {/* checker do not have access on add product */}
                            {user.access_products?.create === 1 && (
                                <AddProduct onRefetch={handleRefetch} />
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
