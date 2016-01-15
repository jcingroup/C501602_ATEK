//------------------------------------------------------------------------------
// <auto-generated>
//     這個程式碼是由範本產生。
//
//     對這個檔案進行手動變更可能導致您的應用程式產生未預期的行為。
//     如果重新產生程式碼，將會覆寫對這個檔案的手動變更。
// </auto-generated>
//------------------------------------------------------------------------------

namespace ProcCore.Business.DB0
{
    using System;
    using System.Collections.Generic;
    
    using Newtonsoft.Json;
    public partial class Product : BaseEntityTable
    {
        public Product()
        {
            this.ProductSelect = new HashSet<ProductSelect>();
            this.PurchaseDetail = new HashSet<PurchaseDetail>();
        }
    
        public string product_no { get; set; }
        public string product_name { get; set; }
        public int product_category_l1_id { get; set; }
        public int product_category_l2_id { get; set; }
        public string unit { get; set; }
        public double price { get; set; }
        public Nullable<double> price_gen { get; set; }
        public Nullable<double> price_mem { get; set; }
        public Nullable<double> price_ent { get; set; }
        public bool state { get; set; }
        public string standard { get; set; }
        public int kvalue { get; set; }
        public Nullable<int> sort { get; set; }
        public string memo { get; set; }
        public string intro { get; set; }
        public string intro_s { get; set; }
        public string video_text { get; set; }
        public bool is_Hot { get; set; }
        public bool is_TopSales { get; set; }
        public bool shipping_state { get; set; }
        public bool i_Hide { get; set; }
        public string i_InsertUserID { get; set; }
        public Nullable<int> i_InsertDeptID { get; set; }
        public Nullable<System.DateTime> i_InsertDateTime { get; set; }
        public string i_UpdateUserID { get; set; }
        public Nullable<int> i_UpdateDeptID { get; set; }
        public Nullable<System.DateTime> i_UpdateDateTime { get; set; }
        public string i_Lang { get; set; }
    
    	[JsonIgnore]
        public virtual ProductCategory_l1 ProductCategory_l1 { get; set; }
    	[JsonIgnore]
        public virtual ProductCategory_l2 ProductCategory_l2 { get; set; }
    	[JsonIgnore]
        public virtual ICollection<ProductSelect> ProductSelect { get; set; }
    	[JsonIgnore]
        public virtual ICollection<PurchaseDetail> PurchaseDetail { get; set; }
    }
}
