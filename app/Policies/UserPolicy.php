<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    //---------------------------ADMIN
    public function admin_create(User $user)
    {
        $admin = $user->load('access_admin');

        return $admin->access_admin && $admin->access_admin->create === 1;
    }
    public function admin_read(User $user)
    {
        $admin = $user->load('access_admin');

        return $admin->access_admin && $admin->access_admin->read === 1;
    }
    public function admin_update(User $user)
    {
        $admin = $user->load('access_admin');

        return $admin->access_admin && $admin->access_admin->update === 1;
    }

    public function admin_access_read(User $user)
    {
        $user = $user->load('access_admin_access_update');

        return $user->access_admin_access_update && $user->access_admin_access_update->read === 1;
    }
    public function admin_access_update(User $user)
    {
        $user = $user->load('access_admin_access_update');

        return $user->access_admin_access_update && $user->access_admin_access_update->update === 1;
    }

    //-------------------CASHIER
    public function cashier_read(User $user)
    {
        $user = $user->load('access_cashier');

        return $user->access_cashier && $user->access_cashier->read === 1;
    }
    public function cashier_in(User $user)
    {
        $user = $user->load('access_cashier_in');

        return $user->access_cashier_in && $user->access_cashier_in->create === 1;
    }
    public function cashier_out(User $user)
    {
        $user = $user->load('access_cashier_out');

        return $user->access_cashier_out && $user->access_cashier_out->create === 1;
    }
    public function cashier_turnover(User $user)
    {
        $user = $user->load('access_cashier_turnover');

        return $user->access_cashier_turnover && $user->access_cashier_turnover->create === 1;
    }
    public function cashier_turnover_logs(User $user)
    {
        $user = $user->load('access_cashier_turnover_logs');

        return $user->access_cashier_turnover_logs && $user->access_cashier_turnover_logs->read === 1;
    }


    public function products_create(User $user)
    {
        $user = $user->load('access_products');

        return $user->access_products && $user->access_products->create === 1;
    }
    public function products_read(User $user)
    {
        $user = $user->load('access_products');

        return $user->access_products && $user->access_products->read === 1;
    }
    public function products_update(User $user)
    {
        $user = $user->load('access_products');

        return $user->access_products && $user->access_products->update === 1;
    }
    public function products_receive(User $user)
    {
        $user = $user->load('access_products_receive');

        return $user->access_products_receive && $user->access_products_receive->update === 1;
    }


    //-------------sales
    public function sales(User $user)
    {
        $user = $user->load('access_sales');

        return $user->access_sales && $user->access_sales->create === 1;
    }
    public function sales_insert(User $user)
    {
        $user = $user->load('access_sales_insert');

        return $user->access_sales_insert && $user->access_sales_insert->read === 1;
    }
    public function sales_lists_read(User $user)
    {
        $user = $user->load('access_sales_lists');

        return $user->access_sales_lists && $user->access_sales_lists->read === 1;
    }
    public function sales_lists_update(User $user)
    {
        $user = $user->load('access_sales_lists');

        return $user->access_sales_lists && $user->access_sales_lists->update === 1;
    }

    //receivables
    public function receivable_read(User $user)
    {
        $user = $user->load('access_receivables');

        return $user->access_receivables && $user->access_receivables->read === 1;
    }
    public function receivable_update(User $user)
    {
        $user = $user->load('access_receivables');

        return $user->access_receivables && $user->access_receivables->update === 1;
    }

    //payables
    public function payables_read(User $user)
    {
        $user = $user->load('access_payables');

        return $user->access_payables && $user->access_payables->read === 1;
    }
    public function payables_update(User $user)
    {
        $user = $user->load('access_payables');

        return $user->access_payables && $user->access_payables->update === 1;
    }
    public function payables_update_details(User $user)
    {
        $user = $user->load('access_payables_update_details');

        return $user->access_payables_update_details && $user->access_payables_update_details->update === 1;
    }
}
