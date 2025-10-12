import { ColumnDef } from "@tanstack/react-table";
import { useDebouncedCallback } from "@mantine/hooks";
import { Group, Text } from "@mantine/core";
import { useAuth } from "../../hooks/auth";
import { useEmployees } from "../../hooks/employees";
import { EmployeeType } from "../../types";
import TanStackMantineCPag, {
    IsSortedType,
} from "../../components/TanStackMantine/TanStackMantineCPag";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { LINKS } from "../../routes";
import AddEditEmployee from "../../components/employee/AddEditEmployee";
import EmployeeLoans from "../../components/employee/loan/EmployeeLoans";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import EmployeeSalary from "../../components/employee/salary/EmployeeSalary";
// import { ActionIcon } from "@mantine/core";
// import { MdEdit } from "react-icons/md";

export default function Employees() {
    const { userData: user } = useAuth();

    const {
        employees,
        employeesLoading,
        filterData,
        setFilterData,
        employeesRefetch,
    } = useEmployees({ enableEmployees: true });

    const columns: ColumnDef<EmployeeType>[] = [
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
            header: "Salary (per day)",
            cell: ({ row }) => {
                return (
                    <Text>{formatNumberWithCommas(row.original.salary)}</Text>
                );
            },
            id: "salary",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Loans",
            cell: ({ row }) => {
                return (
                    <Text>
                        {formatNumberWithCommas(row.original.loans_amount)}
                    </Text>
                );
            },
            id: "loans",
            meta: {
                sorting: false,
            },
        },
        {
            header: "Action",
            cell: ({ row }) => {
                return (
                    <Group>
                        <AddEditEmployee type="edit" employee={row.original} />
                        <EmployeeLoans
                            name={row.original.name}
                            employee_id={row.original.id}
                            {...{ employeesRefetch }}
                        />
                        <EmployeeSalary
                            employee_id={row.original.id}
                            {...{ employeesRefetch }}
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
                rows={employees ? employees.data : []}
                paginate={employees ?? null}
                highlightOnHover
                loading={employeesLoading}
                toolbar={{
                    title: `Employee`,
                    // enableSearch: true,
                    action: (
                        <Group>
                            {user.access_admin?.create === 1 && (
                                <AddEditEmployee type="add" />
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
