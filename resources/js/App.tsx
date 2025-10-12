import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RoutesPage from "./routes/RoutesPage";
import { mantineTheme } from "./utils/theme/mantineTheme";
import { SidebarProvider } from "./context/SidebarContext";
import { Notifications } from "@mantine/notifications";
import TurnoverPopup from "./components/turnover/TurnoverPopup";

const queryClient = new QueryClient();
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={mantineTheme}>
                <SidebarProvider>
                    <Notifications autoClose={5000} />
                    <RoutesPage />
                    <TurnoverPopup />
                </SidebarProvider>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
