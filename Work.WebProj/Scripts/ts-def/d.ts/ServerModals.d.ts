﻿declare module server {
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
        sort: number;
        i_Hide: boolean;
        i_InsertUserID: string;
        i_InsertDeptID: number;
        i_InsertDateTime: Date;
        i_UpdateUserID: string;
        i_UpdateDeptID: number;
        i_UpdateDateTime: Date;
        i_Lang: string;
        aboutUsDetail: server.AboutUsDetail[];
    }
    interface AboutUsDetail extends BaseEntityTable {
        aboutus_detail_id: number;
        aboutus_id: number;
        detail_content: string;
        sort: number;
        i_Hide: boolean;
        i_InsertUserID: string;
        i_InsertDeptID: number;
        i_InsertDateTime: Date;
        i_UpdateUserID: string;
        i_UpdateDeptID: number;
        i_UpdateDateTime: Date;
        i_Lang: string;
        aboutUs: {
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
            aboutUsDetail: server.AboutUsDetail[];
        };
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