import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import React, { useEffect, useRef, useState } from "react"
import {
  UnstyledButton,
  Table,
  Group,
  Text,
  Pagination,
  Select,
  Flex,
  Box,
  Title,
  Button,
  Card,
  Skeleton,
  TextInput,
  CloseIcon,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { IoMdDownload } from "react-icons/io"
import { CiSearch } from "react-icons/ci"
import "@mantine/core/styles/Table.css"
import exportFromJSON from "export-from-json"
import { removeWhiteSpace } from "../../utils/string/removeWhiteSpace"
import * as XLSX from "xlsx"
import { useMedia } from "../../hooks/media"

interface IProps {
  columns: ColumnDef<any>[]
  rows: any[]
  toolbar?: {
    title?: string
    subTitle?: string
    enableSearch?: boolean
    action?: React.JSX.Element
    enableDLXLSX?: boolean
    enableDLCSV?: boolean
  }
  dense?: boolean
  initialSorting?: IsSortedType
  loading?: boolean
  style?: React.CSSProperties
  initialRowCount?: 10 | 25 | 50 | 100 | 200 | number
  rowStyle?: React.CSSProperties
  onRowClick?: (data: any) => void
  withColumnBorders?: boolean
  withRowBorders?: boolean
  highlightOnHover?: boolean
  striped?: boolean
  paginate: PaginationType | null
  handleRowChange: (rows: number) => void
  handlePageChange: (rows: number, page: number) => void
  handleChange?: (e: string) => void
  // filtering?: string
  handleSort?: (sortData: IsSortedType | undefined) => void
}

export default function TanStackMantineCPag({
  columns,
  rows,
  toolbar,
  initialSorting,
  loading,
  style,
  initialRowCount = 10,
  rowStyle,
  onRowClick,
  withColumnBorders,
  withRowBorders,
  highlightOnHover,
  striped,
  paginate,
  handleRowChange,
  handlePageChange,
  handleChange,
  // filtering,
  handleSort,
}: IProps) {
  const { mediaMinLG } = useMedia()

  const tableRef = useRef<HTMLTableElement | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowCount)
  const [isSort, setIsSort] = useState<IsSortedType | undefined>(
    initialSorting ? { ...initialSorting } : undefined
  )
  const [filtering, setFiltering] = useState("")

  //column visibility setup and get column object names on columns
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, col) => {
      acc[col.id as string] =
        col.enableHiding !== undefined ? !col.enableHiding : true
      return acc
    }, {} as Record<string, boolean>)
  )

  const { colorScheme } = useMantineColorScheme()

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    // state: {
    //     // sorting: sorting,
    //     globalFilter: filtering,
    // },
    // onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    // onGlobalFilterChange: setFiltering,
    state: {
      columnVisibility: columnVisibility,
      // sorting: sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
  })

  const handleChangePage = async (newPage: number) => {
    setPage(newPage)

    // console.log(url)
    // table.setPageIndex(newPage - 1)
    handlePageChange(rowsPerPage, newPage)
  }

  //how many rows displayed
  const handleChangeRowsPerPage = (e: number) => {
    //@ts-ignore
    setRowsPerPage(e)
    if (handleRowChange) {
      handleRowChange(e)
    }
    table.setPageSize(e)
    setPage(1)
    table.setPageIndex(0)
  }

  useEffect(() => {
    if (rowsPerPage) {
      table.setPageSize(rowsPerPage)
    }
    // eslint-disable-next-line
  }, [rowsPerPage])
  useEffect(() => {
    if (paginate) {
      setPage(paginate.current_page)
    }
    // eslint-disable-next-line
  }, [paginate])

  useEffect(() => {
    if (columns) {
      setColumnVisibility(
        columns.reduce((acc, col) => {
          acc[col.id as string] =
            col.enableHiding !== undefined ? !col.enableHiding : true
          return acc
        }, {} as Record<string, boolean>)
      )
    }
    // eslint-disable-next-line
  }, [columns])

  const THCell = ({ children, id }: ThRowProps) => {
    // const THCell = ({ children }: ThRowProps) => {
    const Icon = !isSort?.sort
      ? FaSort
      : isSort?.sort === "asc"
      ? FaSortUp
      : FaSortDown

    return (
      <UnstyledButton>
        <Group justify="space-between">
          <Text fw={500}>{children}</Text>
          {isSort && isSort.id === id && <Icon />}
        </Group>
      </UnstyledButton>
    )
  }

  const handleDLCSV = () => {
    try {
      const data = rows.map((item) => {
        // Use object destructuring to dynamically set object names
        const newObj = {}
        columns.forEach((column) => {
          //@ts-ignore
          if (column.accessorKey) {
            //@ts-ignore
            newObj[column.accessorKey] = item[column.accessorKey]
            //@ts-ignore
          } else if (column.columns) {
            //@ts-ignore
            column.columns.forEach((subColumn) => {
              //@ts-ignore
              newObj[subColumn.accessorKey] = item[subColumn.accessorKey]
            })
          } else {
            //@ts-ignore
            newObj[column.accessorKey] = ""
          }
        })
        return newObj
      })

      const fields = {}
      columns.forEach((column) => {
        //@ts-ignore
        if (column.accessorKey) {
          //@ts-ignore
          fields[column.accessorKey] = column.header
          //@ts-ignore
        } else if (column.columns) {
          //@ts-ignore
          column.columns.forEach((subItem) => {
            //@ts-ignore
            fields[subItem.accessorKey] = subItem.header
          })
        } else {
          //@ts-ignore
          fields[column.accessorKey] = ""
        }
      })

      const fileName = toolbar?.title ?? "data"

      const exportType = exportFromJSON.types.csv

      // console.log(data)
      exportFromJSON({ data, fileName, exportType, fields })
    } catch (error) {
      console.error("Download CSV error", error)
    }
  }

  const handleDLXLSX = () => {
    try {
      const ws = XLSX.utils.table_to_sheet(tableRef.current)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
      let name = "table_data"
      if (toolbar?.title) {
        name = toolbar.title
      }
      XLSX.writeFile(wb, `${name}.xlsx`)
    } catch (error) {
      console.error("Download XLSX error", error)
    }
  }

  //this will trigger if column has been clicked
  const handleTSSort = (id: string) => {
    let tsort: IsSortedType | undefined = undefined

    if (isSort?.sort === undefined) {
      tsort = {
        id: id,
        sort: "asc",
      }
    } else if (isSort?.sort && isSort.sort === "asc" && isSort.id === id) {
      tsort = {
        id: id,
        sort: "desc",
      }
    } else if (isSort && isSort.id !== id) {
      tsort = {
        id: id,
        sort: "asc",
      }
    } else {
      tsort = undefined
    }

    setIsSort(tsort)

    if (handleSort) {
      handleSort(tsort)
    }
    // if(hand)
  }

  return (
    <Card shadow="sm" withBorder radius="md" style={{ ...style }}>
      <Card.Section pos="relative">
        {toolbar && (
          <Group
            p="sm"
            // style={{
            //   // backgroundColor: colorScheme === "light" ? "#DCE4F5" : "#5474B4",?
            // }}
            bg={colorScheme === "light" ? "myprimary.1" : "myprimary.9"}
          >
            <Flex direction={"column"} flex={1}>
              <Title order={3} styles={{ root: { flex: 1 } }}>
                {toolbar.title}
              </Title>
              <Title order={5} styles={{ root: { flex: 1 } }}>
                {toolbar.subTitle}
              </Title>
            </Flex>
            {!loading && (
              <>
                {toolbar.enableDLXLSX && (
                  <Button
                    onClick={handleDLXLSX}
                    color="green"
                    leftSection={<IoMdDownload />}
                    size="xs"
                  >
                    xlsx
                  </Button>
                )}
                {toolbar.enableDLCSV && (
                  <Button
                    onClick={handleDLCSV}
                    color="green"
                    leftSection={<IoMdDownload />}
                    size="xs"
                  >
                    csv
                  </Button>
                )}
              </>
            )}
            {toolbar.enableSearch && (
              <TextInput
                placeholder="Search"
                value={filtering}
                onChange={(e) => {
                  setFiltering(e.target.value)
                  if (handleChange) {
                    handleChange(e.target.value)
                  }
                }}
                rightSection={
                  removeWhiteSpace(filtering).length === 0 ? (
                    <CiSearch />
                  ) : (
                    <Tooltip label="Clear">
                      <ActionIcon
                        onClick={() => {
                          setFiltering("")
                          if (handleChange) {
                            handleChange("")
                          }
                        }}
                        variant="subtle"
                      >
                        <CloseIcon />
                      </ActionIcon>
                    </Tooltip>
                  )
                }
              />
            )}
            {toolbar.action}
          </Group>
        )}
        <Box style={{ overflow: "auto" }}>
          <Table
            {...{
              withColumnBorders,
              highlightOnHover,
              withRowBorders,
              striped,
            }}
            ref={tableRef}
          >
            <Table.Thead
              // style={{
              //   backgroundColor:
              //     colorScheme === "light" ? "#DCE4F5" : "#5474B4",
              // }}
              bg={colorScheme === "light" ? "myprimary.1" : "myprimary.9"}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, _index) => (
                    <Table.Th
                      key={header.id}
                      style={{
                        minWidth: (header.column.columnDef.meta as any)
                          ?.colWidth,
                        textAlign:
                          (header.column.columnDef.meta as any)?.align ??
                          "left",
                        fontSize: (header.column.columnDef.meta as any)
                          ?.fontSize,
                        borderLeft: "none",
                        borderRight: "none",
                      }}
                      onClick={(_e) => {
                        //reset page on SORTING
                        // header.column.getToggleSortingHandler()?.(
                        //     e
                        // )
                        const sorting = (header.column.columnDef.meta as any)
                          ?.sorting
                        if (sorting || sorting === undefined) {
                          setPage(1)
                          table.setPageIndex(0)
                          handleTSSort(header.column.id)
                        }
                      }}
                      align={(header.column.columnDef.meta as any)?.align}
                      colSpan={(header.column.columnDef.meta as any)?.colSpan}
                    >
                      <THCell
                        children={
                          header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )
                        }
                        // sorted={
                        //     header.column.getIsSorted()
                        //         ? header.column.getIsSorted() ===
                        //           "asc"
                        //             ? "asc"
                        //             : "desc"
                        //         : undefined
                        // }
                        id={header.column.id}
                      />
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {!loading &&
                table.getRowModel().rows.map((row) => (
                  <Table.Tr
                    key={row.id}
                    style={{ ...rowStyle }}
                    onDoubleClick={() => {
                      if (onRowClick) {
                        // onRowClick(row.original.id)
                        onRowClick(row.original)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td
                        key={cell.id}
                        align={(cell.column.columnDef.meta as any)?.align}
                        style={{
                          fontSize: (cell.column.columnDef.meta as any)
                            ?.fontSize,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              {loading && rows.length <= 0 && (
                <>
                  <Table.Tr>
                    {columns.map(
                      (item, index) =>
                        !item.enableHiding && (
                          <Table.Td key={`row1-${index}`}>
                            <Skeleton height={16} mt={16} />
                          </Table.Td>
                        )
                    )}
                  </Table.Tr>
                  <Table.Tr>
                    {columns.map(
                      (item, index) =>
                        !item.enableHiding && (
                          <Table.Td key={`row2-${index}`}>
                            <Skeleton height={16} mt={16} />
                          </Table.Td>
                        )
                    )}
                  </Table.Tr>
                  <Table.Tr>
                    {columns.map(
                      (item, index) =>
                        !item.enableHiding && (
                          <Table.Td key={`row3-${index}`}>
                            <Skeleton height={16} mt={16} />
                          </Table.Td>
                        )
                    )}
                  </Table.Tr>
                </>
              )}

              {loading && rows.length > 0 && (
                <>
                  {rows.map((_item, ii) => (
                    <Table.Tr key={`row0-${ii}`}>
                      {columns.map(
                        (item, index) =>
                          !item.enableHiding && (
                            <Table.Td key={`row1-${index}`}>
                              <Skeleton height={16} mt={16} />
                            </Table.Td>
                          )
                      )}
                    </Table.Tr>
                  ))}
                </>
              )}
              {!loading && rows.length <= 0 && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} align="center">
                    No Data
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
        {!loading && rows.length > 0 && (
          <Flex
            w="100%"
            gap={10}
            p="sm"
            justify={"flex-end"}
            align={"center"}
            direction={!mediaMinLG ? "column" : "row"}
          >
            <Select
              label="Rows per page"
              data={["10", "25", "50", "100", "200"]}
              value={`${rowsPerPage}`}
              onChange={(e) => {
                //@ts-ignore
                handleChangeRowsPerPage(e)
              }}
              styles={{
                root: {
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                },
                input: {
                  width: 100,
                },
              }}
              allowDeselect={false}
            />
            <Pagination
              total={paginate?.last_page ?? 0}
              value={page}
              onChange={(e) => {
                handleChangePage(e)
              }}
              siblings={1}
            />
          </Flex>
        )}
      </Card.Section>
    </Card>
  )
}

interface ThRowProps {
  children: React.ReactNode
  reversed?: boolean
  id?: string
  // sorted: "asc" | "desc" | undefined
  onSort?: () => void
}

export type IsSortedType = {
  id: string
  sort: "asc" | "desc" | undefined
}

export type PaginationType = {
  current_page: number
  data: any
  first_page_url: string
  from: number
  last_page: number
  links: PaginationLinksType[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

type PaginationLinksType = {
  url: string
  label: string
  active: boolean
}
