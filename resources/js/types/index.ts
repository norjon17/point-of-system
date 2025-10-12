export type UserType = {
  id?: number
  name: string
  username: string
  email?: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
  access_id?: number
  active?: number

  //eloquent
  access?: UserAccessType
  access_admin?: AccessType
  access_admin_access_update?: AccessType
  access_cashier?: AccessType
  access_cashier_in?: AccessType
  access_cashier_out?: AccessType
  access_cashier_turnover?: AccessType
  access_cashier_turnover_logs?: AccessType
  access_products?: AccessType
  access_products_receive?: AccessType
  access_sales?: AccessType
  access_sales_insert?: AccessType
  access_sales_lists?: AccessType
  access_receivables?: AccessType
  access_payables?: AccessType
  access_payables_update_details?: AccessType
}

export type CashTransactionType = {
  id: number
  type_id: number
  user_id: number
  details?: string
  name?: string
  gcash_ref: string | null
  created_at?: string
  updated_at?: string

  //eloquent
  user: UserType
  type: CashTransactionTypeType

  //custom column from laravel
  amount: number
  last_transaction: string
}
export type CashTransactionTypeType = {
  id: number
  type: string
  created_at?: string
  updated_at?: string
}

export type ProductType = {
  id: number
  cat_id: number
  loc_id: number
  uom_id: number
  name: string
  description: string
  image_original_name: string
  image_path_name: string
  barcode: number
  product_cost: number
  selling_price: number
  quantity: number
  batch_number: number
  status: number
  created_at?: string
  updated_at?: string
  cat_sub_id?: number
  item_code?: string
  brand?: string

  //eloquent
  category?: ProductCategoryType
}

export type ProductCategoryType = {
  id: number
  name: string
  description: string
  created_at?: string
  updated_at?: string
  active?: number

  //eloquent
  cat_subs?: ProductCategorySybType[]
  category_sub?: ProductCategorySybType
}
export type ProductCategorySybType = {
  id: number
  cat_id: number
  name: string
  description: string
  created_at?: string
  updated_at?: string
  active?: number
}

export type ProductLocationType = {
  id: number
  name: string
  description: string
  created_at?: string
  updated_at?: string
  active: number
}
export type ProductUOMType = {
  id: number
  name: string
  abbr: string
  created_at?: string
  updated_at?: string
  active: number
}

export type ProductReceiveType = {
  id: number
  product_id: number
  supplier_id: number
  received_by_id: number
  product_cost: number
  amount: number
  quantity: number
  delivery_receipt: string
  image_original_name: string
  image_path_name: string
  payable_date: string | null
  created_at?: string
  updated_at?: string

  //eloquent
  supplier?: SupplierType
  received_by?: UserType
  status?: StatusType
  product?: ProductType
}

export type SupplierType = {
  id: number
  address: string
  balance: number
  company: string
  contact_person: string
  created_at?: string
  updated_at?: string
  active?: number
}

export type CustomerType = {
  id: number
  delivery_address?: string
  total_balance?: number
  company: string
  contact_person: string
  address: string
  created_at?: string
  updated_at?: string
  active?: number
}

export type SidebarItemType = {
  link: string | null
  icon?: React.ReactNode
  label: string
  children?: SidebarItemType[]
  children_style?: React.CSSProperties
  main_link?: string
  hide_menu?: boolean
}

export type LoginType = {
  username: string
  password: string
  remember_me: boolean
}

export type PasswordResetType = {
  current_password: string
  new_password: string
  confirm_password: string
}

export type SelectType = {
  value: string
  label: string
}

export type ReceivableType = {
  id: number
  sales_id: number
  status_id: number
  payment_due_date: string
  created_at?: string
  updated_at?: string

  //eloquent
  sale?: SalesType
  status?: StatusType

  //custom column from laravel
  balance: number
  received: number
}

export type SalesType = {
  id: number
  mode_id: number
  customer_id: number
  service_fee: number
  delivery_fee: number
  discount: number
  price: number
  sub_total: number
  vat: number
  // balance: number
  // received: number
  address: string
  delivered_by_id: number | null
  received_by: string | null
  departed: number | null
  returned: number | null
  vehicle_id: number | null
  delivery_status_id: number | null
  gcash_ref_num: string | null
  created_at?: string
  updated_at?: string

  //eloquent
  customer?: CustomerType
  payment_mode?: PaymentModeType
  order_type?: SalesOrderType
  delivery_status?: DeliveryStatusType

  //custom column in laravel Sale model
  balance: number
  received: number
}

export type PaymentModeType = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}
export type StatusType = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}
export type SalesOrderType = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export type DeliveryStatusType = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export type VehicleType = {
  id: number
  type: string
  plate_num: string
  created_at?: string
  updated_at?: string
}

export type TurnoverType = {
  id: number
  turnover_from_id: number
  accepted_by_id: number
  created_at?: string
  updated_at?: string

  //eloquent
  turnover_from?: UserType
  accepted_by?: UserType
  denominations: TurnoverDenominationType[]
  //custom from laravel
  amount: number
}

export type TurnoverDenominationType = {
  id?: number
  turnover_id?: number
  denomination?: number
  quantity?: number
  created_at?: string
  updated_at?: string
}

export type UserAccessType = {
  id?: number
  access: string
  created_at?: string
  updated_at?: string
}

export type AccessType = {
  id: number
  user_id: number
  module_id: number
  create: number
  read: number
  update: number
  delete: number
  created_at?: string
  updated_at?: string
}

export type AccessModuleType = {
  id: number
  module: string
  description: string
  created_at?: string
  updated_at?: string

  //eloquent
  user_access?: AccessType
}

export type EmployeeType = {
  id: number
  name: string
  active: number
  salary: number
  created_at?: string
  updated_at?: string

  //eloquent
  loans: EmployeeLoanType[]
  //appends
  loans_amount?: number
}

export type EmployeeLoanType = {
  id: number
  employee_id: number
  details: string | null
  created_at?: string
  updated_at?: string

  //custom column in laravel
  amount: number
}
export type EmployeeSalaryType = {
  id: number
  employee_id: number
  salary: number
  daily_salary: number
  days: number
  loan_paid: number
  date_salary: string
  created_at?: string
  updated_at?: string
}

export type WeeklyCashReportType = {
  week: string
  label: string
  start: string
  end: string
  total_in: number
  total_out: number
  total_sale: number
}
export type WeeklyReportType = {
  week: string
  label: string
  start: string
  end: string
  total: number
}

export type MonthlyCashReportType = {
  start: string
  end: string
  label: string
  total_in: number
  total_out: number
  total_sale: number
}
export type MonthlyReportType = {
  start: string
  end: string
  label: string
  total: number
}
