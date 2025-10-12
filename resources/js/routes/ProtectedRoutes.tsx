import { Suspense } from "react";
import { Navigate, Outlet } from "react-router";
import { LINKS } from ".";
import Header from "../components/header/Header/Header";
import { LocalStorageName } from "../constants/constants";
import { AppShell, Box, Loader } from "@mantine/core";
import Sidebar from "../components/sidebar/Sidebar/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/auth";

export default function ProtectedRoutes() {
    const { user, userLoading } = useAuth({ enableUser: true });
    const { isSidebarOpen } = useSidebar();

    const SetLandingPage = () => {
        const currentUrl = window.location.href;
        if (!currentUrl.includes("login")) {
            localStorage.setItem(
                LocalStorageName.initialLandingPage,
                currentUrl
            );
        } else {
            localStorage.removeItem(LocalStorageName.initialLandingPage);
        }
        return <Navigate to={LINKS.LOGIN} />;
    };

    if (userLoading) {
        return (
            <Box
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Loader />
            </Box>
        );
    }

    if (user) {
        return (
            <AppShell
                header={{ height: 50 }}
                navbar={{
                    width: 250,
                    breakpoint: "sm",
                    collapsed: {
                        mobile: isSidebarOpen,
                        desktop: isSidebarOpen,
                    },
                }}
                padding="md"
            >
                <Header />
                <Sidebar />

                <AppShell.Main bg={"gray.0"}>
                    <Suspense
                        fallback={
                            <Box
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "100vh",
                                }}
                            >
                                <Loader />
                            </Box>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </AppShell.Main>
            </AppShell>
        );
    }

    return <SetLandingPage />;
}
