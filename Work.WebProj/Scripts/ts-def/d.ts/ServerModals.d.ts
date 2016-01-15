declare module server {
    interface BaseEntityTable {
        edit_type?: number;
        check_del?: boolean;
        expland_sub?: boolean;
    }
    interface i_Code {
        code: string;
        langCode: string;
        value: string;
    }
    interface CUYUnit {
        sign: string;
        code: string;
    }
    interface i_Lang extends BaseEntityTable {
        lang: string;
        area: string;
        memo: string;
        isuse: boolean;
        sort: any;
    }
    interface SelectFormat {
        id: number | string;
        label: string;
    }
    interface StateTemplate extends SelectFormat {
        className?: string;
        classNameforG: string;
    }
    interface loginField {
        lang: string;
        account: string;
        password: string;
        img_vildate: string;
        rememberme: boolean;

    }
    interface AspNetRoles extends BaseEntityTable {
        Id?: string;
        Name?: string;
        aspNetUsers?: any[];
    }
    interface UserRoleInfo {
        role_id: string;
        role_use: boolean;
        role_name: string;
    }
    interface AspNetUsers extends BaseEntityTable {
        Id?: string;
        email?: string;
        emailConfirmed?: boolean;
        passwordHash?: string;
        securityStamp?: string;
        phoneNumber?: string;
        phoneNumberConfirmed?: boolean;
        twoFactorEnabled?: boolean;
        lockoutEndDateUtc?: Date;
        lockoutEnabled?: boolean;
        accessFailedCount?: number;
        UserName?: string;
        user_name_c?: string;
        department_id?: number;
        aspNetRoles?: server.AspNetRoles[];
        role_array?: Array<UserRoleInfo>;
    }

    interface Product extends BaseEntityTable {
        product_no?: string;
        product_category_l1_id?: number;
        product_category_l2_id?: number;
        product_name?: string;
        price?: number;
        price_gen?: number;
        price_mem?: number;
        standard?: string;
        sort?: number;
        memo?: string;
        kvalue?: number;
        intro?: string;
        unit?: string;
        intro_s?: string;
        video_text?: string;
        price_ent?: number;
        state?: boolean;
        i_Hide?: boolean;
        shipping_state?: boolean;

        imgsrc?: string;
        i_InsertDateTime?: string;
    }
    interface ProductSelect extends BaseEntityTable {
        product_select_id?: number;
        product_no?: string;
        style_name?: string;
        sort?: number;
    }
    interface ProductCategory extends BaseEntityTable {
        product_category_id: number;
        category_name: string;
        sort: number;
    }
    interface Sales extends BaseEntityTable {
        //sales_id?: number;
        sales_no?: string;
        sales_name?: string;
        account?: string;
        password?: string;
        address?: string;
        gender?: boolean;
        rank?: number;
        recommend_no?: string;
        recommend_name?: string; //only client
        share_sn?: string;
        share_sort?: number;
        share_name?: string;
        join_date?: Date;
        sales_state?: number;
        birthday?: Date;
        tel?: string;
        mobile?: string;
        zip?: string;
        email?: string;
        city?: string;
        country?: string;
    }
    interface Purchase extends BaseEntityTable {
        purchase_no?: string;
        set_date?: Date | string;
        sales_no?: string;
        sales_name?: string;
        total?: number;
        state?: number;
        kv_total?: number;
        source?: number;
        payby?: number;
        pickup_state?: number;
        shipping_fee?: number;
        //收件人資訊
        receive_person?: string;
        receive_tel?: string;
        receive_mobile?: string;
        receive_zip?: string;
        receive_city?: string;
        receive_country?: string;
        receive_address?: string;
        email?: string;
        receive_memo?: string;
        //已匯款對帳
        remit_number?: string;
        remit_day?: Date;
        remit_time?: string;
        remit_money?: number;
        remit_memo?: string;
        is_mail?: boolean;
        detail?: Array<server.PurchaseDetail>
    }
    interface PurchaseDetail extends BaseEntityTable {
        purchase_detail_id?: number;
        purchase_no?: string;
        item_no?: number;
        product_no?: string;
        product_name?: string;
        product_select_id?: number;
        style_name?: string;
        qty?: any;
        price?: number;
        kv?: number;
        sub_total?: number;
        kv_sub_total?: number;
        imgsrc?: string;
    }
    interface Settle extends BaseEntityTable {
        settle_id?: number;
        y?: number;
        m?: number;
        set_date?: Date;
        state?: number;
    }
    interface SettleDetail extends BaseEntityTable {
        settle_detail_id?: number;
        settle_id?: number;
        sales_no: string;
        sales_name; string;
        kv_p_sum: number;
        kv_g_sum: number;
        kv_r_sum: number;
        kv_rc_sum: number;
        a_p: number;
        b_p: number;
        a: number;
        b: number;
        rank: number;
        bound: number;
        center_bonus: number;
        office_bonus: number;
        y?: number;
        m?: number;
        set_date?: Date;
        state?: number;
    }
    interface News extends BaseEntityTable {
        news_id?: number;
        news_title?: string;
        news_date?: any;
        news_content?: string;
        sort?: number;
        i_Hide?: boolean;
    }
    interface Issue extends BaseEntityTable {
        issue_id?: number;
        issue_title?: string;
        issue_content?: string;
        sort?: number;
        i_Hide?: boolean;
    }
    interface ProductCategory_l1 extends BaseEntityTable {
        product_category_l1_id?: number;
        category_l1_name?: string;
        sort?: number;
        i_Hide?: boolean;
        ProductCategory_l2?: Array<server.ProductCategory_l2>
    }
    interface ProductCategory_l2 extends BaseEntityTable {
        product_category_l1_id?: number;
        product_category_l2_id?: number;
        category_l2_name?: string;
        sort?: number;
        i_Hide?: boolean;
        ProductCategory_l1?: server.ProductCategory_l1;
    }
    interface PaymentReply extends BaseEntityTable {
        payment_reply_id?: number;
        purchase_no?: string;
        remit_number?: string;
        remit_day?: Date;
        remit_time?: string;
        remit_money?: number;
        memo?: string;
        check_state?: number;

        //顯示
        sales_name?: string;
    }
    interface Banner extends BaseEntityTable {
        banner_id?: number;
        banner_name?: string;
        type?: number;
        sort?: number;
        show_name?: boolean;
        style_string?: string;
        i_Hide?: boolean;
    }
    interface L1 extends BaseEntityTable {
        l1_id?: number;
        l1_name?: string;
        l2_list?: Array<server.L2>
    }
    interface L2 extends BaseEntityTable {
        l2_id?: number;
        l2_name?: string;
    }
} 