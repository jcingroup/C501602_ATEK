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
    interface Banner extends BaseEntityTable {
        banner_id?: number;
        banner_name?: string;
        sort?: number;
        i_Hide?: boolean;
        i_Lang?: string;
    }
    interface AboutUs extends BaseEntityTable {
        aboutus_id: number;
        sort?: number;
        i_Hide?: boolean;
        i_Lang?: string;
        AboutUsDetail?: server.AboutUsDetail[];
    }
    interface AboutUsDetail extends BaseEntityTable {
        aboutus_detail_id?: number;
        aboutus_id?: number;
        detail_content?: string;
        sort?: number;
        edit_state?: EditState;
        i_Hide?: boolean;
        i_Lang?: string;
        AboutUs?: {
            aboutus_id: number;
            sort: number;
            i_Hide: boolean;
            i_InsertUserID: string;
            i_InsertDeptID: number;
            i_InsertDateTime: Date;
            i_UpdateUserID: string;
            i_UpdateDeptID: number;
            i_UpdateDateTime: Date;
            i_Lang: string;
            AboutUsDetail: server.AboutUsDetail[];
        };
    }
    interface Support extends BaseEntityTable {
        support_id?: number;
        support_title?: string;
        support_category?: number;
        day?: Date | string;
        support_content?: string;
        sort?: number;
        i_Hide?: boolean;
        i_Lang?: string;
    }
    interface All_Category_L1 extends BaseEntityTable {
        all_category_l1_id?: number;
        l1_name?: string;
        sort?: number;
        memo?: string;
        i_Hide?: boolean;
        i_Lang?: string;
        All_Category_L2?: server.All_Category_L2[];
    }
    interface All_Category_L2 extends BaseEntityTable {
        all_category_l2_id?: number;
        all_category_l1_id?: number | string;
        l2_name?: string;
        category?: number;
        sort?: number;
        memo?: string;
        i_Hide?: boolean;
        i_Lang?: string;
        All_Category_L1?: server.All_Category_L1;
    }
    interface CategroySort {//分類管理排序用
        id: number;
        sort: number;
    }
    interface LangOption {
        lang?: string;
        items?: Array<server.Option>;
    }
    interface Option {//分類管理選單用
        val?: number;
        Lname?: string;
    }
} 