import React from "react"
import { Routes, Route } from "react-router"
import { LINKS } from "."
import ProtectedRoutes from "./ProtectedRoutes"

const Home = React.lazy(() => import("../pages/home/Home"))
const Login = React.lazy(() => import("../pages/auth/Login"))
const AccountSetting = React.lazy(() => import("../pages/auth/AccountSetting"))

//Cash
const Transanctions = React.lazy(() => import("../pages/cash/Transanctions"))
const Turnovers = React.lazy(() => import("../pages/turnover/Turnovers"))
//Products
const Products = React.lazy(() => import("../pages/products/Products"))
//Sales
const PointOfSale = React.lazy(() => import("../pages/sales/PointOfSale"))
const Sales = React.lazy(() => import("../pages/sales/Sales"))

const Receivables = React.lazy(() => import("../pages/receivables/Receivables"))
const Payables = React.lazy(() => import("../pages/payables/Payables"))
const Employees = React.lazy(() => import("../pages/employees/Employees"))

//admin pages
const Customers = React.lazy(() => import("../pages/admin/customers/Customers"))
const Suppliers = React.lazy(() => import("../pages/admin/suppliers/Suppliers"))
const Users = React.lazy(() => import("../pages/admin/users/Users"))
const Categories = React.lazy(
  () => import("../pages/admin/categories/Categories")
)
const UOM = React.lazy(() => import("../pages/admin/uom/UOM"))
const Location = React.lazy(() => import("../pages/admin/location/Location"))

//error pages
const PageNotFound = React.lazy(() => import("../pages/error/PageNotFound"))
const AccessDenied = React.lazy(() => import("../pages/error/AccessDenied"))

export default function RoutesPage() {
  return (
    <Routes>
      <Route element={<ProtectedRoutes />}>
        <Route path={LINKS.HOME} element={<Home />} />
        <Route path={LINKS.ACCOUNT_SETTING} element={<AccountSetting />} />

        {/* CASH */}
        <Route path={LINKS.CASHIER} element={<Transanctions />} />

        {/* TURNOVER */}
        <Route path={LINKS.TURNOVERS} element={<Turnovers />} />

        {/* Products */}
        <Route path={LINKS.PRODUCTS} element={<Products />} />

        {/* SALES */}
        <Route path={LINKS.SALES} element={<PointOfSale />} />
        <Route path={LINKS.SALES_LISTS} element={<Sales />} />

        <Route path={LINKS.RECEIVABLES} element={<Receivables />} />

        {/* ADMIN PAGES */}
        <Route path={LINKS.CUSTOMER_LIST} element={<Customers />} />
        <Route path={LINKS.SUPPLIER_LIST} element={<Suppliers />} />
        <Route path={LINKS.USERS} element={<Users />} />
        <Route path={LINKS.CATEGORIES} element={<Categories />} />
        <Route path={LINKS.UOM} element={<UOM />} />
        <Route path={LINKS.LOCATIONS} element={<Location />} />

        <Route path={LINKS.PAYABLES} element={<Payables />} />
        <Route path={LINKS.EMPLOYEE} element={<Employees />} />

        <Route path={"*"} element={<PageNotFound />} />
        <Route path={LINKS.ACCESS_DENY} element={<AccessDenied />} />
      </Route>
      <Route path={LINKS.LOGIN} element={<Login />} />
      <Route path={"*"} element={<PageNotFound />} />
    </Routes>
  )
}
