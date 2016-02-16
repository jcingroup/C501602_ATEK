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
    public enum AllCategoryType
    {
        Support = 1,
        News = 2
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

    public partial class C50A0_ATEKEntities : DbContext
    {
        public C50A0_ATEKEntities(string connectionstring)
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
    public partial class m_News
    {
        public string imgsrc { get; set; }
    }
    public partial class m_Banner
    {
        public string imgsrc { get; set; }
    }
    public partial class m_AboutUsDetail
    {
        public EditState edit_state { get; set; }
    }
    public partial class AboutUsDetail
    {
        public EditState edit_state { get; set; }
    }
    public partial class m_Support
    {
        public string l2_name { get; set; }
        public string fileSrc { get; set; }
        //public string[] fileSrcs { get; set; }
    }
    public partial class m_News
    {
        public string l2_name { get; set; }

    }
    public partial class m_Product_Category_L2
    {
        public string l1_name { get; set; }
    }
    public partial class m_Product_Category_L3
    {
        public string l1_name { get; set; }
        public string l2_name { get; set; }
    }
    public partial class m_Product
    {
        public string l1_name { get; set; }
        public string l2_name { get; set; }
        public string l3_name { get; set; }
    }
    public partial class Menu
    {
        public IList<MenuRoleArray> role_array { get; set; }
    }
    public class MenuRoleArray
    {
        public string role_id { get; set; }
        public bool role_use { get; set; }
        public string role_name { get; set; }
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
        public List<L3> l3_list { get; set; }
    }
    public class L3
    {
        public int l3_id { get; set; }
        public string l3_name { get; set; }
    }
    public class Param
    {
        public string Email { get; set; }
    }
    public class option
    {
        public int val { get; set; }
        public string Lname { get; set; }
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
