//本文件值需由Server傳送給RLayout.html 或 Main.cshtml
var gb_approot: string;
var gb_caption: string //目前執行的系統標題
var gb_menuname: string //目前執行的系統選單名稱
var gb_area: string
var gb_controller: string
var gb_action: string
var gb_def_action: string;

var debug_account: string;
var debug_password: string;
var debug_validate: string;

//後台 總分類管理用
var gb_MainId: number;//all_category_l1_id

var gb_rank: number;
var gb_sales_no: string;
var gb_roles: string;

//google reCAPTCHA
var grecaptcha: any;
var widgetId: any;