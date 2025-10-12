import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import React, { useEffect, useState } from "react"
import {
  UnstyledButton,
  Table,
  Group,
  Text,
  useMantineColorScheme,
  Pagination,
  Select,
  Flex,
  Box,
  Title,
  Button,
  Input,
  Card,
  Skeleton,
} from "@mantine/core"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { IoMdDownload } from "react-icons/io"
import { CiSearch } from "react-icons/ci"
import "@mantine/core/styles/Table.css"
import xlsx, { IJsonSheet } from "json-as-xlsx"
import exportFromJSON from "export-from-json"
import { nanoid } from "nanoid"

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
  initialSorting?: SortingState
  loading?: boolean
  style?: React.CSSProperties
  initialRowCount?: 5 | 10 | 25 | 50 | 100
  rowStyle?: React.CSSProperties
  onRowClick?: (id: number) => void
  withColumnBorders?: boolean
  withRowBorders?: boolean
  highlightOnHover?: boolean
  striped?: boolean
}

export default function TanStackMantine({
  columns,
  rows,
  toolbar,
  initialSorting = [], //{desc: boolean, id: 'accessorKey'}
  loading,
  style,
  initialRowCount = 50,
  rowStyle,
  onRowClick,
  withColumnBorders,
  withRowBorders,
  highlightOnHover,
  striped,
}: IProps) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowCount)
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [filtering, setFiltering] = useState("")
  //column visibility setup and get column object names on columns
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, col) => {
      acc[col.id as string] =
        col.enableHiding !== undefined ? !col.enableHiding : true
      return acc
    }, {} as Record<string, boolean>)
  )

  const { colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  })

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
      columnVisibility: columnVisibility,
    },
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setFiltering,
    onColumnVisibilityChange: setColumnVisibility,
  })

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
    table.setPageIndex(newPage - 1)
  }

  //how many rows displayed
  const handleChangeRowsPerPage = (e: number) => {
    //@ts-ignore
    setRowsPerPage(e)
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

  //update columns visibility if changed
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

  const THCell = ({ children, sorted }: ThRowProps) => {
    const Icon = !sorted ? FaSort : sorted === "asc" ? FaSortUp : FaSortDown

    return (
      <UnstyledButton>
        <Flex
          justify="space-between"
          align={"center"}
          style={{ whiteSpace: "nowrap" }}
        >
          <Text fw={500}>{children}</Text>
          <Icon color="inherit" />
        </Flex>
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
      let xcolumns: any[] = []
      columns.forEach((item) => {
        //@ts-ignore
        if (item.accessorKey) {
          xcolumns.push({
            label: item.header,
            //@ts-ignore
            value: item.accessorKey,
          })
          //@ts-ignore
        } else if (item.columns) {
          //@ts-ignore
          item.columns.forEach((subItem) => {
            xcolumns.push({
              label: subItem.header,
              //@ts-ignore
              value: subItem.accessorKey,
            })
          })
        } else {
          xcolumns.push({
            label: item.header,
            //@ts-ignore
            value: item.header.toLowerCase(),
          })
        }
      })

      let data: IJsonSheet[] = [
        {
          sheet: toolbar?.title ?? "data",
          //@ts-ignore
          columns: xcolumns,
          content: rows.map((item) => {
            // Use object destructuring to dynamically set object names
            const newObj = {}
            xcolumns.forEach((column) => {
              //@ts-ignore
              if (column.value) {
                //@ts-ignore
                newObj[column.value] = item[column.value]
              } else {
                //@ts-ignore
                newObj[column.value] = ""
              }
            })
            return newObj
          }),
        },
      ]
      // console.log(data)
      // console.log(rows)
      let settings = {
        fileName: toolbar?.title ?? "data", // Name of the resulting spreadsheet
        // extraLength: 3, // A bigger number means that columns will be wider
        // writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
        // writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
        // RTL: true, // Display the columns from right-to-left (the default value is false)
      }
      xlsx(data, settings)
    } catch (error) {
      console.error("Download XLSX error", error)
    }
  }

  return (
    <Card shadow="sm" withBorder radius="md" style={{ ...style }}>
      <Card.Section pos="relative">
        {toolbar && (
          <Group
            p="sm"
            // style={{
            //   backgroundColor: colorScheme === "light" ? "#DCE4F5" : "#5474B4",
            // }}
            bg={colorScheme === "light" ? "myprimary.3" : "myprimary.9"}
          >
            {!loading && (
              <Flex direction={"column"} flex={1}>
                <Title order={4} styles={{ root: { flex: 1 } }}>
                  {toolbar.title}
                </Title>
                <Text styles={{ root: { flex: 1 } }}>{toolbar.subTitle}</Text>
              </Flex>
            )}
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
                {toolbar.enableSearch && (
                  <Input
                    placeholder="Search"
                    size="xs"
                    value={filtering}
                    onChange={(e) => setFiltering(e.target.value)}
                    rightSection={<CiSearch />}
                  />
                )}
                {toolbar.action}
              </>
            )}
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
          >
            <Table.Thead
              // style={{
              //   backgroundColor:
              //     colorScheme === "light" ? "#DCE4F5" : "#5474B4",
              // }}
              bg={colorScheme === "light" ? "myprimary.3" : "myprimary.9"}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={`${headerGroup.id}-${nanoid()}`}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th
                      key={`${header.id}-${nanoid()}`}
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
                      onClick={(e) => {
                        //reset page on SORTING
                        header.column.getToggleSortingHandler()?.(e)
                        setPage(0)
                        table.setPageIndex(0)
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
                        sorted={
                          header.column.getIsSorted()
                            ? header.column.getIsSorted() === "asc"
                              ? "asc"
                              : "desc"
                            : undefined
                        }
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
                    key={`${row.id}-${nanoid()}`}
                    style={{ ...rowStyle }}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row.original.id)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td
                        key={`${cell.id}-${nanoid()}`}
                        align={(cell.column.columnDef.meta as any)?.align}
                        style={{
                          fontSize: (cell.column.columnDef.meta as any)
                            ?.fontSize,
                          whiteSpace: (cell.column.columnDef.meta as any)
                            ?.whiteSpace,
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
              {loading && (
                <>
                  <Table.Tr>
                    {columns.map((_item, index) => (
                      <Table.Td key={`row1-${index}-${nanoid()}`}>
                        <Skeleton height={16} mt={16} />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                  <Table.Tr>
                    {columns.map((_item, index) => (
                      <Table.Td key={`row2-${index}-${nanoid()}`}>
                        <Skeleton height={16} mt={16} />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                  <Table.Tr>
                    {columns.map((_item, index) => (
                      <Table.Td key={`row3-${index}-${nanoid()}`}>
                        <Skeleton height={16} mt={16} />
                      </Table.Td>
                    ))}
                  </Table.Tr>
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
          <Flex w="100%" gap={10} p="sm" justify={"flex-end"}>
            <Select
              label="Rows per page"
              data={["5", "10", "25", "50", "100"]}
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
              total={rows.length / rowsPerPage}
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
  sorted: "asc" | "desc" | undefined
  onSort?: () => void
}
