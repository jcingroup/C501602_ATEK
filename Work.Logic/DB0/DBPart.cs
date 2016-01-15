using System;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
namespace ProcCore.Business.DB0
{
    public enum EditState
    {
        Insert = 0,
        Update = 1
    }
    public enum VisitDetailState
    {
        none,
        wait,
        progress,
        finish,
        pause
    }
    public enum SourceState
    {
        onSite = 1,//現場
        online = 2 //網路訂購
    }
    public enum PaybyState
    {
        Cash = 1,//付現
        ATM = 2,//atm轉帳
        CashOnDelivery = 3//貨到付款
    }
    public enum PurchaseState
    {
        onSite = 0,//現場付款
        waitForPayment = 1,//待繳款
        waitForPaymentCheckout = 2,//待對帳確認
        waitForShip = 3,//匯款完畢待出貨通知
        complete = 4//訂單完成
    }
    public enum PaymentReplyState
    {
        notCheck = 0,//未核對
        correct = 1,//核對正確
        error = -1//核對錯誤
    }
    public enum PurchaseViewType
    {
        self = 1,//個人消費紀錄
        share = 2,//共享圈消費紀錄
        member = 3,//直推會員消費紀錄
        manager = 4,//直推經理人消費紀錄
        center = 5//間接推薦會員消費紀錄
    }
    public enum SalesRankState
    {
        notSet = 0,//未設定
        general = 1,//一般會員
        manager = 2,//經理人
        operationsCenter = 3,//營運中心
        managementOffice = 4//管理處
    }
    public enum SalesRiseRankType
    {
        generalToManager = 1,//一般會員->經理人
        managerToOperationsCenter = 2,//經理人->營運中心
        operationsCenterToManagerOffice = 3//營運中心->管理處
    }
    public enum ShippingState
    {
        HomoiothermyFee = 0,//常溫:false
        RefrigerFee = 1//冷凍、冷藏:true
    }
    public enum PurchasePickupState
    {
        online = 0, //現場取貨
        delivery = 1,//宅配
        getBySelf = 2//自行取貨
    }

    public enum BannerType
    {
        banner = 1,
        firm = 2
    }
    public enum SettleState
    {
        progress = 1,//結算中
        complete = 2//結算完成
    }
    #region set CodeSheet

    public static class CodeSheet
    {
        public static List<i_Code> sales_rank = new List<i_Code>()
        {
            new i_Code{ Code = 1, Value = "共享會員", LangCode = "wait" },
            new i_Code{ Code = 2, Value = "經理人", LangCode = "progress" },
            new i_Code{ Code = 3, Value = "營運中心", LangCode = "finish" },
            new i_Code{ Code = 4, Value = "管理處", LangCode = "pause" }
        };

        public static string GetStateVal(int code, List<i_Code> data)
        {
            string Val = string.Empty;
            foreach (var item in data)
            {
                if (item.Code == code)
                    Val = item.Value;
            }
            return Val;
        }
    }
    public class i_Code
    {
        public int? Code { get; set; }
        public string LangCode { get; set; }
        public string Value { get; set; }
    }
    #endregion

    public partial class C13B0_1KomoEntities : DbContext
    {
        public C13B0_1KomoEntities(string connectionstring)
            : base(connectionstring)
        {
        }

        public override Task<int> SaveChangesAsync()
        {
            return base.SaveChangesAsync();
        }
        public override int SaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (DbEntityValidationException ex)
            {
                Log.Write(ex.Message, ex.StackTrace);
                foreach (var err_Items in ex.EntityValidationErrors)
                {
                    foreach (var err_Item in err_Items.ValidationErrors)
                    {
                        Log.Write("欄位驗證錯誤", err_Item.PropertyName, err_Item.ErrorMessage);
                    }
                }

                throw ex;
            }
            catch (DbUpdateException ex)
            {
                Log.Write("DbUpdateException", ex.InnerException.Message);
                throw ex;
            }
            catch (EntityException ex)
            {
                Log.Write("EntityException", ex.Message);
                throw ex;
            }
            catch (UpdateException ex)
            {
                Log.Write("UpdateException", ex.Message);
                throw ex;
            }
            catch (Exception ex)
            {
                Log.Write("Exception", ex.Message);
                throw ex;
            }
        }

    }
    #region Model Expand

    public partial class Sales
    {
        public string share_name { get; set; }
    }
    public partial class m_Sales
    {
        public int? rise_type { get; set; }
        public int sub_count { get; set; }
    }
    public partial class Purchase
    {
        public string sales_name { get; set; }
        public bool is_mail { get; set; }
        public IList<PurchaseDetail> detail { get; set; }
    }
    public partial class m_Purchase
    {
        public string sales_name { get; set; }
    }
    public partial class PurchaseDetail
    {
        public string imgsrc { get; set; }
    }
    public partial class m_Product
    {
        public string imgsrc { get; set; }
    }
    public partial class Product
    {
        public string[] imgsrcs { get; set; }
        public string category_l1_name { get; set; }
        public string category_l2_name { get; set; }
    }
    public partial class m_News
    {
        public string imgsrc { get; set; }
    }
    public partial class m_ProductCategory_l2
    {
        public string category_l1_name { get; set; }
    }
    public partial class PaymentReply
    {
        public string day_string { get; set; }
        public string sales_name { get; set; }
    }
    public partial class m_PaymentReply
    {
        public int state { get; set; }
        public string sales_name { get; set; }
    }
    public partial class m_Banner
    {
        public string imgsrc { get; set; }
    }
    public class PutPurchaseCheckPram
    {
        public string id { get; set; }
        public int state { get; set; }
        public bool is_mail { get; set; }
    }
    public class L1
    {
        public int l1_id { get; set; }
        public string l1_name { get; set; }
        public List<L2> l2_list { get; set; }
    }
    public class L2
    {
        public int l2_id { get; set; }
        public string l2_name { get; set; }
    }
    public class Param
    {
        public string Email { get; set; }
        public decimal PurchaseTotal { get; set; }
        public decimal HomoiothermyFee { get; set; }//常溫運費
        public decimal RefrigerFee { get; set; }//冷凍(冷藏)運費
        public string AccountName { get; set; }
        public string BankName { get; set; }
        public string BankCode { get; set; }
        public string AccountNumber { get; set; }
        public decimal Fee { get; set; }
    }
    #endregion

    #region q_Model_Define
    public class q_AspNetRoles : QueryBase
    {
        public string Name { set; get; }

    }
    public class q_AspNetUsers : QueryBase
    {
        public string UserName { set; get; }

    }
    #endregion

    #region c_Model_Define
    public class c_AspNetRoles
    {
        public q_AspNetRoles q { get; set; }
        public AspNetRoles m { get; set; }
    }
    public partial class c_AspNetUsers
    {
        public q_AspNetUsers q { get; set; }
        public AspNetUsers m { get; set; }
    }
    #endregion
}
