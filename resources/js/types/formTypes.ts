import { DateValue } from "@mantine/dates";

export type CashFormType = {
    type_id: number;
    details?: string;
    name?: string;
    denominations: DenominationType[];
    employee_id?: number | null;
};
export type CashFormTypeV2 = {
    type_id: number;
    details?: string;
    name?: string;
    amount: number | null;
    employee_id?: number | null;
};

type DenominationType = {
    denomination: number;
    quantity: number | null;
};

export type ProductFormType = {
    id?: number;
    cat_id: number | null;
    cat_sub_id?: number | null;
    loc_id: number | null;
    uom_id: number | null;
    name: string;
    description: string;
    image_original_name: string;
    image_path_name: string;
    barcode: number | null;
    product_cost: number;
    selling_price: number;
    quantity: number;
    batch_number: number;
    status: number;

    item_code: string | null;
    brand: string | null;

    image: File | null;
};

export type CustomerFormType = {
    id?: number | null;
    address: string | null;
    company: string | null;
    contact_person: string | null;
    active: number;
};

export type SupplierFormType = {
    id?: number | null;
    address: string | null;
    company: string | null;
    contact_person: string | null;
    active: number;
};

export type ReceiveProductForm = {
    id?: number | null;
    product_id: number | null;
    supplier_id: number | null;
    product_cost: number;
    quantity: number;

    delivery_receipt: string;
    image: File | null;
    received_by_id: number | null;

    amount: number | null;
    payable_date: Date | null;
};

export type POSFormType = {
    customer_id: number | null;
    service_fee: number | null;
    delivery_fee: number | null;
    discount: number | null;
    orders: POSOrderType[];
    cash: number | null;
    cash_mode: "cash" | "gcash";
    gcash_ref_num?: string | null;
    payment_due_date?: DateValue;
    order_type?: SalesOrderManualType;
    address?: string | null;
};

export type POSOrderType = {
    product_id: number;
    name: string;
    quantity: number;
    discount: number | null;
    selling_price: number;
    total: number;

    //useFieldArray
    index?: number;
    id?: string;
    //custom
    random_id?: string;
};

export type SalesOrderManualType = "pickup" | "delivery" | null;

export type DeliverUpdateFormType = {
    address: string;
    delivered_by_id: number | null;
    vehicle_id: number | null;
    received_by: string | null;
    departed: Date | null;
    returned: Date | null;
    delivery_status_id: number | null;
};

export type ReceivableFormType = {
    cash: number | null;
    cash_mode: "cash" | "gcash";
    gcash_ref?: string | null;
};

export type PayableFormType = {
    cash: number | null;
};

export type TurnoverFormType = {
    denominations: DenominationType[];
};

export type UserFormType = {
    id?: number | null;
    name: string;
    username: string;
    password: string;
    access_id: number | null;
    active: number;
};

export type CategoryFormType = {
    id?: number | null;
    name: string | null;
    description: string | null;
    active: number;
};

export type CategorySubFormType = {
    id?: number | null;
    cat_id: number | null;
    name: string | null;
    description: string | null;
    active: number;
};

export type UOMFormType = {
    id?: number | null;
    name: string | null;
    abbr: string | null;
    active: number;
};
export type LocationFormType = {
    id?: number | null;
    name: string | null;
    description: string | null;
    active: number;
};

export type AccessGroupFormType = {
    accesses: AccessFormType[];
};

export type AccessFormType = {
    id?: number | null;
    user_id: number;
    module_id: number;
    create: number;
    read: number;
    update: number;
    delete: number;
};

export type EmployeeFormType = {
    id?: number | null;
    name: string | null;
    salary: number | null;
    active: number;
};

export type EmployeeLoanFormType = {
    id?: number | null;
    employee_id: number;
    amount: number | null;
    details: string | null;
};
export type EmployeeSalaryFormType = {
    id?: number | null;
    employee_id: number;
    days: number | null;
    salary: number;
    loan_to_pay: number | null;
    date_salary: Date | null;
};
