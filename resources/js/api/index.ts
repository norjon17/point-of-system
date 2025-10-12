export enum API {
    CSRF_TOKEN = "/sanctum/csrf-cookie",

    //user
    LOGIN = "/api/login",
    LOGOUT = "/api/logout",
    USER = "/api/user",
    UPDATE_PASSWORD = "/api/password-update",

    CASH = "/api/cash",
    TURNOVER = "/api/turnover",

    MENU = "/api/menu",

    PRODUCT = "/api/product",
    SALE = "/api/sale",
    RECEIVABLE = "/api/receivable",
    PAYABLE = "/api/payable",

    //admin
    CUSTOMER = "/api/customers",
    SUPPLIER = "/api/suppliers",
    USERS = "/api/users",
    UOM = "/api/uom",
    LOCATION = "/api/location",
    ACCESSES = "/api/accesses",
    EMPLOYEES = "/api/employees",

    CATEGORIES = "/api/categories",
    CATEGORY_SUBS = "/api/category-subs",

    DASHBOARD = "/api/dashboard",

    PRINT = "/api/print",
}
