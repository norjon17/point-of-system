import { ColumnDef } from "@tanstack/react-table"
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks"
import TanStackMantineCPag, {
  IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag"
import { ActionIcon, Group, Modal, Text, Tooltip } from "@mantine/core"
import { ProductCategorySybType } from "../../types"
import { useCategorySub } from "../../hooks/category_subs"
import { CiViewTable } from "react-icons/ci"
import AddEditCategorySub from "./AddEditCategorySub"

interface IProps {
  cat_id: number
  cat_name: string
}
export default function CategorySub({ cat_id, cat_name }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const { categorySub, categorySubLoading, filterData, setFilterData } =
    useCategorySub({ enableCatSub: opened, cat_id })

  const columns: ColumnDef<ProductCategorySybType>[] = [
    {
      header: "Sub Category",
      cell: ({ cell }) => {
        return (
          <Text
            c={cell.row.original.active !== 1 ? "red" : undefined}
            style={{
              textDecoration:
                cell.row.original.active !== 1 ? "line-through" : undefined,
            }}
          >
            {cell.row.original.name}
          </Text>
        )
      },
      id: "company",
      meta: {
        sorting: false,
      },
    },
    {
      header: "Description",
      cell: ({ cell }) => {
        return cell.row.original.description
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
            <AddEditCategorySub
              type="edit"
              category={cell.row.original}
              cat_id={cell.row.original.cat_id}
              filterData={filterData}
            />
          </Group>
        )
      },
      id: "action",
      meta: {
        sorting: false,
      },
    },
  ]

  const handleSearch = useDebouncedCallback((value: string) => {
    setFilterData((c) => ({
      ...c,
      page: 1,
      search: value,
    }))
  }, 500)

  const columSort = (sortData: IsSortedType | undefined) => {
    // console.log(sortData);
    setFilterData((c) => ({
      ...c,
      order_by: sortData,
    }))
  }

  return (
    <>
      <Tooltip label="Sub Category">
        <ActionIcon
          onClick={() => {
            open()
          }}
          radius={"xl"}
          color="gray"
        >
          <CiViewTable size={20} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"100%"}
      >
        <TanStackMantineCPag
          columns={columns}
          rows={categorySub ? categorySub.data : []}
          paginate={categorySub ?? null}
          highlightOnHover
          loading={categorySubLoading}
          toolbar={{
            title: `Sub Categories for ${cat_name}`,
            // enableSearch: true,
            action: (
              <Group>
                <AddEditCategorySub
                  type="add"
                  cat_id={cat_id}
                  filterData={filterData}
                />
              </Group>
            ),
          }}
          handlePageChange={(rows, page) => {
            setFilterData((c) => ({
              ...c,
              rows,
              page,
            }))
          }}
          handleRowChange={(rows) => {
            setFilterData((c) => ({
              ...c,
              page: 1,
              rows,
            }))
          }}
          handleSort={columSort}
          handleChange={(e) => {
            handleSearch(e)
          }}
          initialSorting={
            filterData.order_by ? { ...filterData.order_by } : undefined
          }
          style={{
            width: "100%",
          }}
        />
      </Modal>
    </>
  )
}
