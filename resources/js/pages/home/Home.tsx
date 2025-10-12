import { useAuth } from "../../hooks/auth";
import AdminDashboard from "../../components/home/AdminDashboard";
import DefaultHome from "../../components/home/DefaultHome";
import CashierDashboard from "../../components/home/CashierDashboard";

export default function Home() {
    const { userData: user } = useAuth();

    if (user.access_admin?.read === 1) {
        return <AdminDashboard />;
    } else if (user.access_cashier?.read === 1) {
        return <CashierDashboard />;
    } else {
        return <DefaultHome />;
    }
}
