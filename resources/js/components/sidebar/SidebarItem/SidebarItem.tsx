import React from "react"
import { Link, useLocation } from "react-router"
import { NavLink, Title } from "@mantine/core"
import type { SidebarItemType } from "../../../types"
import { useEffect, useState } from "react"
import { nanoid } from "nanoid"
import { useMedia } from "../../../hooks/media"
import { useSidebar } from "../../../context/SidebarContext"

// interface IProps {
//   link: string | null;
//   icon?: React.ReactNode;
//   label: string;
//   children?: SidebarItemType[];
// }

// Component for rendering a sidebar item
export default function SidebarItem({
  link,
  icon,
  label,
  children,
  children_style,
  main_link,
}: SidebarItemType) {
  const { mediaMinMD } = useMedia()
  const location = useLocation()
  const { isSidebarOpen, setSidebarOpen } = useSidebar()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (
      children &&
      children.some(
        (i) =>
          i.link &&
          (window.location.pathname.includes(i.link) ||
            (i.main_link && window.location.pathname.includes(i.main_link)))
      )
    ) {
      setOpen(true)
    }
  }, [location])

  const MyIcon = () => {
    return icon ? icon : <></>
  }

  const containsLink =
    link &&
    (window.location.pathname.includes(link) ||
      (main_link && window.location.pathname.includes(main_link)))

  return (
    <NavLink
      // c={containsLink ? "inherit" : "white"}
      // color={"darkBlue.5"}
      // color={"sidebar.0"}
      component={Link}
      to={link || "#"}
      onClick={(e) => {
        if (!mediaMinMD && link) {
          setSidebarOpen(!isSidebarOpen)
        }

        if (children) {
          e.preventDefault()
          setOpen((c) => !c)
        }
      }}
      // leftSection={
      //   link && icon ? (
      //     <ThemeIcon
      //       color={"inherit"}
      //       // bg={"darkBlue.6"}
      //       bg={"sidebar"}
      //       // m={5}
      //       variant={
      //         window.location.pathname.includes(link) ? "white" : "light"
      //       }
      //       h={35}
      //       w={35}
      //     >
      //       {icon}
      //     </ThemeIcon>
      //   ) : null
      // }
      leftSection={<MyIcon />}
      w="100%"
      // mih={rem(40)}
      // label={
      //   <Title size={"h6"} fw={500}>
      //     {label}
      //   </Title>
      // }
      label={
        <Title order={6} fw={500}>
          {label}
        </Title>
      }
      active
      variant={containsLink ? "filled" : "subtle"}
      styles={{
        root: {
          borderRadius: 5,
          ...children_style,
        },
      }}
      opened={children && open}
    >
      {/* If the children are provided, render them as nested sidebar items */}
      {children?.map((item, index) => {
        if (item.hide_menu) {
          return <React.Fragment key={nanoid()} />
        } else {
          return (
            <SidebarItem
              key={`${index}-${nanoid()}`}
              // link={item.link}
              // label={item.label}
              // children={item.children}
              {...{ ...item }}
              children_style={{
                borderLeft: "1px solid #ccc",
                // color: containsLink ? "white" : "#B5B5B5",
                borderRadius: "unset",
              }}
            />
          )
        }
      })}
    </NavLink>
  )
}
