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
    public partial class m_PaymentReply :BaseEntityTable {
    public int payment_reply_id { get; set; }
    public string purchase_no { get; set; }
    public string remit_number { get; set; }
    public System.DateTime remit_day { get; set; }
    public Nullable<System.TimeSpan> remit_time { get; set; }
    public int remit_money { get; set; }
    public string memo { get; set; }
    public System.DateTime i_InsertDateTime { get; set; }
    public int check_state { get; set; }
    }
}
