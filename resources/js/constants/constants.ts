export const DEF_MSG = {
    REQUIRED: "This field is required.",
    NUMERIC: "This fiels must be a number.",
    MIN: "The value must be equal or greater than",
    MAX: "The value must be equal or less than",
    SERVER_ERR_MSG: "Server Error. Please contact IT Dept.",
};

export const WEB_APP_NAME =
    (import.meta.env.VITE_APP_NAME as string) ?? "Point of System";

export const CURRENTLINK = `${window.location.protocol}//${window.location.host}`;

export const APP_DEBUG: boolean =
    (import.meta.env.VITE_APP_DEBUG as boolean) ?? false;

export const BREAKPOINTS = {
    xs: "30em",
    sm: "48em",
    md: "64em",
    lg: "74em",
    xl: "90em",
};

export enum QUERY_NAME {
    USER = "user",
    VERSION = "appVersion",
    SIDEBAR_ITEMS = "sidebarItems",
    CASH = "cash",
    MENU = "menu",
    PRODUCT = "product",
    SALES = "sales",
    RECEIVABLES = "receivables",
    CUSTOMERS = "customers",
    SUPPLIER = "suppliers",
    PAYABLES = "payables",
    TURNOVERS = "turnovers",
    CATEGORIES = "categories",
    CATEGORY_SUBS = "category-subs",
    UOMS = "uoms",
    LOCATIONS = "locations",
    EMPLOYEE = "employee",
    DASHBOARD = "dashboard",
}

export const heightCenter = "calc(100vh - 85px)";

export enum LocalStorageName {
    IsDarkMode = "isdarkmode",
    IsCollapse = "iscollapse",
    initialLandingPage = "initialLandingPage",
}

export const MIMETYPES = {
    png: "image/png",
    gif: "image/gif",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    webp: "image/webp",
    avif: "image/avif",
    heic: "image/heic",
    mp4: "video/mp4",
    zip: "application/zip",
    csv: "text/csv",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    exe: "application/vnd.microsoft.portable-executable",
};

export const imageValidation = {
    validate: {
        isImage: (value: File | null) =>
            !value ||
            ["image/jpeg", "image/png", "image/gif"].includes(value.type) ||
            "Only JPEG, PNG, or GIF images are allowed",
    },
};
export const imageValidationRequired = {
    required: DEF_MSG.REQUIRED,
    validate: {
        // Check if file is provided
        hasFile: (value: File | null) =>
            value instanceof File || DEF_MSG.REQUIRED,
        // Check file type (e.g., only images)
        isImage: (value: File | null) =>
            !value ||
            ["image/jpeg", "image/png", "image/gif"].includes(value.type) ||
            "Only JPEG, PNG, or GIF images are allowed",
        // Check file size (e.g., max 5MB)
        // isSizeValid: (value: File | null) =>
        //   !value || value.size <= 100 * 1024 * 1024 || "Maximum file size is 100MB",
    },
};

export const numberValidation = {
    min: {
        value: 0,
        message: "This field cannot be negative",
    },
    valueAsNumber: true,
};
export const quantityValidation = {
    min: {
        value: 1,
        message: "This field must be at least 1",
    },
    valueAsNumber: true,
};
