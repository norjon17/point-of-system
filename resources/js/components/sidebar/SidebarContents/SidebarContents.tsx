import { Flex, ScrollArea } from "@mantine/core"
import SidebarItem from "../SidebarItem/SidebarItem"
import { LINKS } from "../../../routes/index"
import type { SidebarItemType } from "../../../types"
import { nanoid } from "nanoid"
import { FaCashRegister } from "react-icons/fa6"
import { MdInventory } from "react-icons/md"
import { FaPesoSign } from "react-icons/fa6"
import { TiShoppingCart } from "react-icons/ti"
import { MdAdminPanelSettings } from "react-icons/md"
import { useAuth } from "../../../hooks/auth"
import React from "react"

// Component for rendering the sidebar contents
export default function SidebarContents() {
  const { userData: user } = useAuth()

  // Sidebar Links
  const data: SidebarItemType[] = [
    {
      link: null,
      label: "Cashier",
      icon: <FaCashRegister />,
      hide_menu:
        user.access_cashier_turnover_logs?.read !== 1 &&
        user.access_cashier?.read !== 1,
      children: [
        {
          link: LINKS.CASHIER,
          label: "Cashier",
          hide_menu: user.access_cashier?.read !== 1,
        },
        {
          link: LINKS.TURNOVERS,
          label: "Turn Over",
          hide_menu: user.access_cashier_turnover_logs?.read !== 1,
        },
      ],
    },
    {
      link: LINKS.PRODUCTS,
      label: "Products",
      icon: <MdInventory />,
      hide_menu: user.access_products?.read !== 1,
    },
    {
      link: null,
      label: "Point of Sale",
      icon: <TiShoppingCart />,
      hide_menu:
        user.access_sales?.create !== 1 && user.access_sales_lists?.read !== 1,
      children: [
        {
          link: LINKS.SALES,
          main_link: LINKS.SALES,
          label: "Sales",
          hide_menu: user.access_sales?.create !== 1,
        },
        {
          link: LINKS.SALES_LISTS,
          main_link: LINKS.SALES_LISTS,
          label: "Lists",
          hide_menu: user.access_sales_lists?.read !== 1,
        },
      ],
    },
    {
      link: null,
      label: "Accounting",
      icon: <FaPesoSign />,
      hide_menu:
        user.access_receivables?.read !== 1 && user.access_payables?.read !== 1,
      children: [
        {
          link: LINKS.RECEIVABLES,
          label: "Receivables",
          hide_menu: user.access_receivables?.read !== 1,
        },
        {
          link: LINKS.PAYABLES,
          label: "Payables",
          hide_menu: user.access_payables?.read !== 1,
        },
      ],
    },
    {
      link: LINKS.EMPLOYEE,
      label: "Employees",
      icon: <MdInventory />,
      hide_menu: user.access_admin?.read !== 1,
    },
    {
      link: null,
      label: "Administrator",
      icon: <MdAdminPanelSettings />,
      hide_menu: user.access_admin?.read !== 1, //only admin can access
      children: [
        {
          link: LINKS.LOCATIONS,
          main_link: LINKS.LOCATIONS,
          label: "Location",
        },
        {
          link: LINKS.UOM,
          main_link: LINKS.UOM,
          label: "Unit of measures",
        },
        {
          link: LINKS.CATEGORIES,
          main_link: LINKS.CATEGORIES,
          label: "Categories",
        },
        {
          link: LINKS.CUSTOMER_LIST,
          main_link: LINKS.CUSTOMER_LIST,
          label: "Customers",
        },
        {
          link: LINKS.SUPPLIER_LIST,
          main_link: LINKS.SUPPLIER_LIST,
          label: "Suppliers",
        },
        {
          link: LINKS.USERS,
          label: "Users",
        },
      ],
    },
  ]
  // Map the data array to create a list of SidebarItem components
  // Each SidebarItem component will be associated with a link, label, and children
  const links = data.map((item) => {
    if (item.hide_menu) {
      return <React.Fragment key={nanoid()} />
    }
    return (
      <SidebarItem
        key={item.link ?? nanoid()}
        // link={item.link}
        // label={item.label}
        // children={item.children}
        {...{ ...item }}
      />
    )
  })

  return (
    <ScrollArea scrollbars="y">
      <Flex direction={"column"} gap={5}>
        {/* <Title ta={"center"} c={"white"}>
          ITApp
        </Title> */}
        {/* <Space h={"xl"} /> */}
        {links}
      </Flex>
    </ScrollArea>
  )
}
