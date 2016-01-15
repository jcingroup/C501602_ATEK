using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.NetExtension;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.EntityClient;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace ProcCore.Business
{
    public enum CodeTable
    {
        Base, Product, ProductCategory_l1, ProductCategory_l2,
        Sales, News, Issue, Banner,
        Purchase, PaymentReply, PurchaseSite,
        Settle
    }
    public enum SNType
    {
        Orders, Product, Receiver, Import, Stock, Export, StockAdj,
    }
    /// <summary>
    /// 客戶類別
    /// </summary>
    public enum CustomerType
    {
        Store = 1, //店家
        Straight = 2 //直客        
    }
    /// <summary>
    /// 客戶型態
    /// </summary>
    public enum CustomerKind
    {
        LS,
        BeerStore,
        Dancing,
        Bar,
        Cafe

    }

}
namespace ProcCore.Business.LogicConect
{
    #region Parm Section
    public enum ParmDefine
    {
        Open, AboutUs, Email, PurchaseTotal,
        HomoiothermyFee, RefrigerFee,
        AccountName, BankName, BankCode, AccountNumber, Fee
    }
    #endregion

    public class LogicCenter
    {
        private static string db0_connectionstring;
        protected C13B0_1KomoEntities db0;
        protected TransactionScope tx;
        private const string DatabaseName = "C13B0_1Komo";
        public int DepartmentId { get; set; }
        public string Lang { get; set; }
        public string IP { get; set; }
        public string AspUserID { get; set; }
        public static string GetDB0EntityString(string configstring)
        {
            string[] DataConnectionInfo = configstring.Split(',');

            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
            builder.DataSource = DataConnectionInfo[0];
            builder.UserID = DataConnectionInfo[1];
            builder.Password = DataConnectionInfo[2];
            builder.InitialCatalog = DatabaseName;
            builder.IntegratedSecurity = false;
            builder.PersistSecurityInfo = false;

            EntityConnectionStringBuilder entBuilder = new EntityConnectionStringBuilder();
            entBuilder.Provider = "System.Data.SqlClient";
            entBuilder.ProviderConnectionString = builder.ConnectionString;
            entBuilder.Metadata = String.Format("res://{0}/{1}.csdl|res://{0}/{1}.ssdl|res://{0}/{1}.msl", "Proc.BusinessLogic", "DB0." + DatabaseName);
            return entBuilder.ConnectionString;
        }
        public static string GetDB0ConnectionString(string configstring)
        {
            string[] DataConnectionInfo = configstring.Split(',');

            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
            builder.DataSource = DataConnectionInfo[0];
            builder.UserID = DataConnectionInfo[1];
            builder.Password = DataConnectionInfo[2];
            builder.InitialCatalog = DatabaseName;
            builder.MultipleActiveResultSets = true;
            builder.IntegratedSecurity = false;

            return builder.ConnectionString;
        }
        public LogicCenter() { }
        public LogicCenter(string db0_configstring)
        {
            db0_connectionstring = LogicCenter.GetDB0EntityString(db0_configstring);
        }

        public static C13B0_1KomoEntities getDB0
        {
            get
            {
                return new C13B0_1KomoEntities(db0_connectionstring);
            }
        }
        public int GetNewId(CodeTable tab)
        {
            int i = 0;

            using (var tx = new TransactionScope())
            {
                var get_id_db = getDB0;

                try
                {
                    string tab_name = Enum.GetName(typeof(ProcCore.Business.CodeTable), tab);
                    var item = get_id_db.i_IDX.Where(x => x.table_name == tab_name)
                        .ToList()
                        .FirstOrDefault();

                    if (item != null)
                    {
                        item.IDX++;
                        get_id_db.SaveChanges();
                        tx.Complete();
                        i = item.IDX;
                    }
                }
                catch (Exception ex)
                {
                    Log.Write(ex.ToString());
                }
                finally
                {
                    get_id_db.Dispose();
                }
                return i;
            }
        }
        private SNObject GetSN(SNType tab)
        {
            SNObject sn = new SNObject();

            using (var tx = new TransactionScope())
            {
                var get_sn_db = getDB0;
                try
                {
                    get_sn_db = getDB0;
                    string tab_name = Enum.GetName(typeof(ProcCore.Business.SNType), tab);
                    var items = get_sn_db.i_SN.Single(x => x.sn_type == tab_name);

                    if (items.y == DateTime.Now.Year &&
                        items.m == DateTime.Now.Month &&
                        items.d == DateTime.Now.Day
                        )
                    {
                        int now_max = items.sn_max;
                        now_max++;
                        items.sn_max = now_max;
                    }
                    else
                    {
                        items.y = DateTime.Now.Year;
                        items.m = DateTime.Now.Month;
                        items.d = DateTime.Now.Day;
                        items.sn_max = 1;
                    }

                    get_sn_db.SaveChanges();
                    tx.Complete();

                    sn.y = items.y;
                    sn.m = items.m;
                    sn.d = items.d;
                    sn.sn_max = items.sn_max;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                finally
                {
                    get_sn_db.Dispose();
                }
            }
            return sn;
        }
        public string getReceiverSN() //
        {
            String tpl = "TY{0}{1:00}{2:00}-{3:00}";
            SNObject sn = GetSN(ProcCore.Business.SNType.Receiver);
            return string.Format(tpl, sn.y.ToString().Right(2), sn.m, sn.d, sn.sn_max);
        }
        public object getParmValue(ParmDefine ParmName)
        {
            db0 = getDB0;
            string getName = Enum.GetName(typeof(ParmDefine), ParmName);
            var item = db0.i_Parm.Where(x => x.ParmName == getName).FirstOrDefault();
            if (item != null)
            {
                if (item.ParmType == "S")
                {
                    return item.S;
                }
                if (item.ParmType == "I")
                {
                    return item.I;
                }
                if (item.ParmType == "F")
                {
                    return item.F;
                }
                if (item.ParmType == "D")
                {
                    return item.D;
                }
                if (item.ParmType == "B")
                {
                    return item.B;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }
        public void setParmValue(ParmDefine ParmName, object value)
        {
            db0 = getDB0;
            string str = Enum.GetName(typeof(ParmDefine), ParmName);
            var item = db0.i_Parm.Where(x => x.ParmName == str).FirstOrDefault();
            if (item != null)
            {
                if (item.ParmType == "S")
                {
                    item.S = (string)value;
                }
                if (item.ParmType == "I")
                {
                    item.I = (int)value;
                }
                if (item.ParmType == "F")
                {
                    item.F = (decimal)value;
                }
                if (item.ParmType == "D")
                {
                    item.D = (DateTime)value;
                }
                if (item.ParmType == "B")
                {
                    item.B = (bool)value;
                }
            }
            db0.SaveChanges();
        }
        public string[] getReceiveMails()
        {
            var s = (string)getParmValue(ParmDefine.Email);

            string[] r = s.Split(',');
            return r;
        }
        public static void SetDB0EntityString(string configstring)
        {
            db0_connectionstring = GetDB0EntityString(configstring);
        }

        public ResultInfo SettleCal(int y, int m)
        {
            db0 = getDB0;
            var r = new ResultInfo();
            try
            {
                #region MyRegion
                //上個月日期
                var p_date = DateTime.Parse(y + "/" + m + "/1").AddMonths(-1);

                //清空 SettleCal 資料
                string sql = "delete from SettleCal where sales_no!='A'";
                db0.Database.ExecuteSqlCommandAsync(sql).Wait();

                //清楚計算月的資料
                sql = "delete from SettleDetail where y=@y and m=@m";
                SqlParameter[] sps = new SqlParameter[] { new SqlParameter("@y", y), new SqlParameter("@m", m) };
                db0.Database.ExecuteSqlCommandAsync(sql, sps).Wait();

                var sales_colle = db0.Sales.Select(x => new SalesCalInfo()
                {
                    sales_no = x.sales_no,
                    sales_name = x.sales_name,
                    rank = x.rank,
                    share_sn = x.share_sn,
                    share_level = x.share_level,
                    share_name = x.ShareParent.sales_name
                }).Where(x => x.sales_no != "A").ToList(); //取得會員

                var sales_sum_kv = db0.PurchaseDetail
                .Where(x => x.Purchase.set_date.Year == y && x.Purchase.set_date.Month == m)
                .GroupBy(x => new { x.Purchase.sales_no })
                .Select(g => new { sales_no = g.Key.sales_no, sum_kv = g.Sum(x => x.kv_sub_total) }).ToList();

                foreach (var sales in sales_colle)
                {
                    var md = new SettleCal();
                    var obj = sales_sum_kv.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    if (obj != null)
                    {
                        md.sales_no = sales.sales_no;
                        md.sales_name = sales.sales_name;
                        md.rank = sales.rank;
                        md.share_level = sales.share_level;
                        md.share_sn = sales.share_sn;
                        md.share_name = sales.share_name;
                        md.KV = obj.sum_kv;
                    }
                    else
                    {
                        md.sales_no = sales.sales_no;
                        md.sales_name = sales.sales_name;
                        md.rank = sales.rank;
                        md.share_level = sales.share_level;
                        md.share_sn = sales.share_sn;
                        md.share_name = sales.share_name;
                        md.KV = 0;
                    }
                    db0.SettleCal.Add(md);
                }
                //以上只算出每位會員KV值
                db0.SaveChangesAsync().Wait();

                var sales_kv_data = db0.SettleCal.Where(x => x.KV >= 1000).ToList();

                //取得上個月結算全部資料
                var sales_settle_pre = db0.SettleDetail.Where(x => x.y == p_date.Year && x.m == p_date.Month).ToList();
                #endregion

                foreach (var sales in sales_kv_data)
                {
                    #region MyRegion
                    var p = sales_settle_pre.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    var md = new SettleDetail();

                    //加總子系KV值 且往下只探四層
                    var cal_kv_sum = sales.SettleCalSub
                        .Traverse(x => x.SettleCalSub)
                        .Where(x => x.share_level < sales.share_level + 4)
                        .Sum(x => x.KV);

                    md.settle_id = 1;
                    md.y = y;
                    md.m = m;

                    md.sales_no = sales.sales_no;
                    md.sales_name = sales.sales_name;
                    md.rank = sales.rank;

                    md.kv_p_sum = sales.KV;
                    md.kv_g_sum = cal_kv_sum;

                    var x1 = Convert.ToInt32(cal_kv_sum * 0.01);
                    var x2 = Convert.ToInt32(sales.KV * 0.75);

                    md.a = x1 > x2 ? x2 : x1;

                    if (p != null)
                    {
                        md.a_p = p.a;
                        md.b_p = p.b;
                    }
                    else
                    {
                        md.a_p = 0;
                        md.b_p = 0;
                    }

                    //計算本月累計回饋金
                    md.b = x2 + md.b_p - md.a_p;

                    //全部總KV
                    var total_kv = sales_kv_data.Sum(x => x.KV);
                    if (sales.rank == 1 || sales.rank == 2) //經理人獎金
                    {
                        var f = sales.SettleCalSub.Sum(x => x.KV) * 0.12;
                    }

                    if (sales.rank == 2) //營運中心
                    {

                    }

                    db0.SettleDetail.Add(md);

                    #endregion
                }

                db0.SaveChangesAsync().Wait();

                r.result = true;
                return r;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return r;
            }
            finally
            {
                db0.Dispose();
            }
        }

        public ResultInfo SettleCalVerion2(int y, int m)
        {
            db0 = getDB0;
            var r = new ResultInfo();
            try
            {
                #region MyRegion
                //上個月日期
                var p_date = DateTime.Parse(y + "/" + m + "/1").AddMonths(-1);
                //上上個月日期
                var pp_date = DateTime.Parse(y + "/" + m + "/1").AddMonths(-2);

                //清空 SettleCal 資料
                string sql = "delete from SettleCal where sales_no!='A'";
                db0.Database.ExecuteSqlCommandAsync(sql).Wait();

                //清楚計算月的資料
                sql = "delete from SettleDetail where y=@y and m=@m";
                SqlParameter[] sps = new SqlParameter[] { new SqlParameter("@y", y), new SqlParameter("@m", m) };
                db0.Database.ExecuteSqlCommandAsync(sql, sps).Wait();

                var sales_colle = db0.Sales.Select(x => new SalesCalInfo()
                {
                    sales_no = x.sales_no,
                    sales_name = x.sales_name,
                    rank = x.rank,
                    recommend_no = x.recommend_no,
                    recommend_name = x.recommend_name,
                    share_sn = x.share_sn,
                    share_level = x.share_level,
                    share_name = x.ShareParent.sales_name
                }).Where(x => x.sales_no != "A").ToList(); //取得會員

                var sales_sum_kv = db0.PurchaseDetail
                .Where(x => x.Purchase.set_date.Year == y && x.Purchase.set_date.Month == m & x.Purchase.state == (int)PurchaseState.complete)
                .GroupBy(x => new { x.Purchase.sales_no })
                .Select(g => new { sales_no = g.Key.sales_no, sum_kv = g.Sum(x => x.kv_sub_total) }).ToList();

                foreach (var sales in sales_colle)
                {
                    var md = new SettleCal();
                    var obj = sales_sum_kv.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    if (obj != null)
                    {
                        md.sales_no = sales.sales_no;
                        md.sales_name = sales.sales_name;
                        md.rank = sales.rank;
                        md.share_level = sales.share_level;
                        md.share_sn = sales.share_sn;
                        md.share_name = sales.share_name;
                        md.recommend_no = sales.recommend_no;
                        md.recommend_name = sales.recommend_name;
                        md.KV = obj.sum_kv;
                    }
                    else
                    {
                        md.sales_no = sales.sales_no;
                        md.sales_name = sales.sales_name;
                        md.rank = sales.rank;
                        md.share_level = sales.share_level;
                        md.share_sn = sales.share_sn;
                        md.share_name = sales.share_name;
                        md.recommend_no = sales.recommend_no;
                        md.recommend_name = sales.recommend_name;
                        md.KV = 0;
                    }
                    db0.SettleCal.Add(md);
                }

                #region 取出該月獎金計算主檔

                var settle = db0.Settle.Where(x => x.y == y & x.m == m).FirstOrDefault();
                if (settle == null)
                {
                    settle = new Settle()
                    {
                        settle_id = GetNewId(CodeTable.Settle),
                        y = y,
                        m = m,
                        state = (int)SettleState.progress,
                        set_date = DateTime.Now
                    };
                    db0.Settle.Add(settle);
                }
                #endregion

                //以上只算出每位會員KV值
                db0.SaveChangesAsync().Wait();

                var sales_kv_data = db0.SettleCal.Where(x => x.KV >= 1000).ToList();

                //取得上個月結算全部資料
                var sales_settle_pre = db0.SettleDetail.Where(x => x.y == p_date.Year && x.m == p_date.Month).ToList();
                //取得上上個月結算全部資料
                var sales_settle_prepre = db0.SettleDetail.Where(x => x.y == pp_date.Year && x.m == pp_date.Month).ToList();

                #endregion

                #region 消費滿1000kv
                foreach (var sales in sales_kv_data)
                {
                    #region MyRegion
                    var p = sales_settle_pre.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    var md = new SettleDetail();

                    #region 計算共享圈消費總kv
                    //加總子系KV值 且往下只探四層,取當月總消費(未滿1000kv也列入)
                    var cal_kv_sum = sales.SettleCalSub
                        .Traverse(x => x.SettleCalSub)
                        .Where(x => (x.share_level <= sales.share_level + 4))
                        .Sum(x => x.KV);
                    #endregion
                    #region 計算直推會員總kv
                    var r_kv_sum = 0;
                    //加總子系KV值 ,取當月總消費(未滿1000kv也列入)
                    if (sales.rank >= (int)SalesRankState.manager)
                    {//經理人以上才需要計算
                        r_kv_sum = sales.SettleCalRSub.Sum(x => x.KV);
                    }
                    #endregion
                    #region 計算直推經理人是否達30在線&下線總消費額
                    int count_manager = 0;
                    int l_kv_sum = 0;
                    //找出消費滿1000kv且等級為經理人以上且下線有達三位消費滿1000kv
                    if (sales.rank >= (int)SalesRankState.operationsCenter)
                    {//營運中心以上才需要計算                                           
                        foreach (var sub in sales.SettleCalRSub.Where(x => x.KV >= 1000 & x.rank >= (int)SalesRankState.manager))
                        {
                            if (sub.SettleCalRSub.Where(x => x.KV >= 1000).Count() >= 3)
                                count_manager++;
                        }
                        if (count_manager >= 30)
                        {
                            l_kv_sum = sales.SettleCalRSub.Traverse(x => x.SettleCalRSub).Sum(x => x.KV);
                        }
                    }
                    #endregion
                    #region 計算直推營運中心營業總kv
                    var rc_kv_sum = 0;
                    if (sales.rank == (int)SalesRankState.managementOffice)
                    {//管理處以上才需要計算
                        rc_kv_sum = sales.SettleCalRSub.Where(x => x.rank >= (int)SalesRankState.operationsCenter)
                                                             .Traverse(x => x.SettleCalRSub).Sum(x => x.KV);
                    }
                    #endregion

                    md.settle_id = settle.settle_id;
                    md.y = y;
                    md.m = m;

                    md.sales_no = sales.sales_no;
                    md.sales_name = sales.sales_name;
                    md.rank = sales.rank;

                    md.kv_p_sum = sales.KV;//個人_kv總計
                    md.kv_g_sum = cal_kv_sum;//共享圈_kv總計
                    md.kv_r_sum = r_kv_sum;//直推會員_kv總計
                    md.kv_l_sum = l_kv_sum;//直推+間接會員_kv總計
                    md.kv_rc_sum = rc_kv_sum;//直推營運中心營業額_kv總計

                    md.count_manager = count_manager;//直推經理人在線人數

                    var x1 = Convert.ToInt32(cal_kv_sum * 0.01);
                    var x2 = Convert.ToInt32(sales.KV * 0.75);

                    md.a = x1 > x2 ? x2 : x1;

                    #region 上月累計獎金
                    if (p != null)
                    {
                        md.a_p = p.a;
                        md.b_p = p.b;
                    }
                    else
                    {
                        md.a_p = 0;
                        md.b_p = 0;
                    }
                    #endregion

                    //計算本月累計回饋金
                    md.b = x2 + md.b_p - md.a;

                    if (sales.rank >= (int)SalesRankState.manager) //經理人獎金
                    {
                        md.bound = Convert.ToInt32(md.kv_r_sum * 0.12);
                    }
                    if (sales.rank == (int)SalesRankState.operationsCenter & count_manager >= 30) //營運中心
                    {//30位經理人在線
                        md.center_bonus = Convert.ToInt32(md.kv_l_sum * 0.02);
                    }
                    if (sales.rank == (int)SalesRankState.managementOffice & count_manager >= 30)//管理處
                    {//30位經理人在線
                        md.center_bonus = Convert.ToInt32((md.kv_l_sum - md.kv_rc_sum) * 0.02);//管理處的營運中心紅利算法(與rank=營運中心)不太一樣
                        md.office_bonus = Convert.ToInt32(md.kv_rc_sum * 0.01);
                    }

                    db0.SettleDetail.Add(md);

                    #endregion
                }
                #endregion

                #region 消費未滿1000kv(計算累計回饋)
                var accumulate_kv_data = db0.SettleCal.Where(x => x.KV < 1000 & x.sales_no != "A").ToList();
                foreach (var sales in accumulate_kv_data)
                {
                    #region MyRegion
                    var p = sales_settle_pre.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    var pp = sales_settle_pre.FirstOrDefault(x => x.sales_no == sales.sales_no);
                    var md = new SettleDetail();

                    md.settle_id = settle.settle_id;
                    md.y = y;
                    md.m = m;

                    md.sales_no = sales.sales_no;
                    md.sales_name = sales.sales_name;
                    md.rank = sales.rank;

                    md.kv_p_sum = sales.KV;//個人_kv總計
                    md.kv_g_sum = 0;//共享圈_kv總計
                    md.kv_r_sum = 0;//直推會員_kv總計
                    md.kv_l_sum = 0;//直推+間接會員_kv總計
                    md.kv_rc_sum = 0;//直推營運中心營業額_kv總計

                    md.count_manager = 0;//直推經理人在線人數
                    md.bound = 0;//經理人獎金
                    md.center_bonus = 0;//營運中心獎金
                    md.office_bonus = 0;//管理處獎金

                    //var x1 = Convert.ToInt32(cal_kv_sum * 0.01);
                    var x2 = Convert.ToInt32(sales.KV * 0.75);

                    md.a = 0;//未滿1000kv回饋金為0

                    #region 上月累計獎金
                    int pp_kv_p_sum = 0;//上上個月個人_kv總計
                    int p_kv_p_sum = 0;//上個月個人_kv總計
                    if (p != null)
                    {
                        md.a_p = p.a;
                        md.b_p = p.b;
                        p_kv_p_sum = p.kv_p_sum;
                    }
                    else
                    {
                        md.a_p = 0;
                        md.b_p = 0;
                    }
                    pp_kv_p_sum = pp != null ? pp.kv_p_sum : 0;
                    #endregion

                    //計算本月累計回饋金
                    md.b = x2 + md.b_p - md.a;
                    //連續三個月消費未滿1000kv累計回饋金歸0
                    if (pp_kv_p_sum < 1000 & p_kv_p_sum < 1000)
                        md.b = 0;

                    db0.SettleDetail.Add(md);

                    #endregion
                }
                #endregion

                db0.SaveChangesAsync().Wait();

                r.result = true;
                return r;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return r;
            }
            finally
            {
                db0.Dispose();
            }
        }
        private class SalesCalInfo
        {
            public string sales_no { get; set; }
            public string sales_name { get; set; }
            public byte rank { get; set; }
            public string share_sn { get; set; }
            public string share_name { get; set; }
            public int share_level { get; set; }
            public string recommend_no { get; set; }
            public string recommend_name { get; set; }
        }
        /// <summary>
        /// 查詢該員其下共享圈樹狀結構會員
        /// </summary>
        /// <param name="sales_no"></param>
        /// <returns></returns>
        public SalesTree GetShareBySales(string sales_no, string exexclude_no)
        {

            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                var data = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level + 4 >= sales.share_level).ToList();

                SalesTree n = new SalesTree()
                {
                    sales_no = sales_no,
                    sales_name = sales.sales_name,
                    sub = null
                };

                IList<SalesTree> L = new List<SalesTree>();
                foreach (var t in sales.ShareSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sub = null
                    };

                    var k = QSub(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;
                    L.Add(m);
                }
                n.sub_count = L.Count();
                n.sub = ReMarkData(L, exexclude_no);
                return n;
            }

        }
        private SalesTree[] QSub(string sales_no, IEnumerable<Sales> data)
        {
            IList<SalesTree> L = new List<SalesTree>();

            var f = data.FirstOrDefault(x => x.sales_no == sales_no);
            if (f != null)
            {
                foreach (var t in f.ShareSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sub = null
                    };

                    var k = QSub(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;
                    L.Add(m);
                }
            }

            return L.ToArray();
        }
        private IList<SalesTree> ReMarkData(IList<SalesTree> data, string sales_no)
        {

            IList<SalesTree> n = new List<SalesTree>();
            foreach (var item in data)
            {
                if (item.sales_no == sales_no)
                {
                    var m = new SalesTree()
                    {
                        sales_no = item.sales_no,
                        sales_name = item.sales_name,
                        sub_count = 3,
                        is_me = true,
                        sub = new List<SalesTree>() //排除其下探詢
                    };
                    n.Add(m);
                    //return n;
                }
                else
                {
                    var m = new SalesTree()
                    {
                        sales_no = item.sales_no,
                        sales_name = item.sales_name,
                        sub_count = item.sub_count,
                        is_me = false,
                        sub = ReMarkData(item.sub, sales_no)
                    };
                    n.Add(m);
                }
            }

            return n;
        }

        #region 一般會員_取得本月回饋
        public SettleSelfInfo SettleSelf(int y, int m, string sales_no)
        {
            SettleSelfInfo info = new SettleSelfInfo();
            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                DateTime last = DateTime.Now.AddMonths(-1);
                var getB = db0.SettleDetail.Where(x => x.Settle.y == last.Year & x.Settle.m == last.Month & x.sales_no == sales.sales_no).FirstOrDefault();
                int b_p = 0;
                if (getB != null)
                {
                    b_p = getB.b;//取得上個月累計回饋
                }
                #region 基本個人獎金
                //取得共享圈成員
                var share_no = sales.ShareSub
                .Traverse(x => x.ShareSub)
                .Where(x => x.share_level > sales.share_level & x.share_level <= (sales.share_level + 4)).ToList();

                //取得當月個人消費總kv
                int? kv_total = sales.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                //取得當月共享圈消費總kv
                int share_kv_total = 0;
                foreach (var share in share_no)
                {
                    int? temp_kv_total = share.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                    if (temp_kv_total != null)
                    {
                        share_kv_total += (int)temp_kv_total;
                    }
                }
                info.kv_total = (int)kv_total;
                info.share_kv_total = share_kv_total;
                if (kv_total >= 1000)
                {//兩者計算取最小值
                    int temp_a = Convert.ToInt32((int)kv_total * 0.75);
                    int temp_b = Convert.ToInt32(share_kv_total * 0.01);
                    info.self_bonus = temp_a > temp_b ? temp_b : temp_a;
                }
                #endregion
                info.b = Convert.ToInt32((int)kv_total * 0.75) + b_p - info.self_bonus;

                #region 經理人獎金
                int recommend_kv_total = 0;//直推會員總kv
                int count_manager = 0;//計算直推經理人合格有幾人
                if (sales.rank >= (int)SalesRankState.manager)
                {
                    foreach (var sub in sales.SalesSub)
                    {
                        int? temp_kv_total = sub.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                        if (temp_kv_total != null)
                        {
                            recommend_kv_total += (int)temp_kv_total;
                            #region 計算合格經理人有幾人
                            if (sub.rank >= (int)SalesRankState.manager & temp_kv_total >= 1000)
                            {
                                int sub_count = 0;
                                foreach (var sub_sub in sub.SalesSub)
                                {
                                    int? temp_sub_kv_total = sub_sub.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                                    if (temp_sub_kv_total >= 1000)
                                        sub_count++;
                                }
                                if (sub_count >= 3)
                                    count_manager++;
                            }
                            #endregion
                        }
                    }
                    info.count_manager = count_manager;
                    info.recommend_kv_total = recommend_kv_total;
                    if (kv_total >= 1000)
                    {
                        //當月消費滿1000kv 及等級為經理人才有此獎金          
                        info.manager_bonus = Convert.ToInt32(recommend_kv_total * 0.12);
                    }
                }
                #endregion

                #region 營運中心獎金
                int AllLine_kv_total = 0;
                if (sales.rank >= (int)SalesRankState.operationsCenter)
                {//30位經理人以上合格
                 //取得下線成員
                    var r_no = sales.SalesSub
                    .Traverse(x => x.SalesSub).ToList();
                    foreach (var r in r_no)
                    {
                        int? temp_kv_total = r.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                        AllLine_kv_total += (int)temp_kv_total;
                    }
                    info.AllLine_kv_total = AllLine_kv_total;
                    if (kv_total >= 1000 & sales.rank == (int)SalesRankState.operationsCenter & count_manager >= 30)
                        info.center_bonus = Convert.ToInt32(AllLine_kv_total * 0.02);
                }
                #endregion

                #region 管理處紅利

                if (sales.rank == (int)SalesRankState.managementOffice)
                {
                    //取得直推會員內等級為營運中心(以上)的會員及該會員下線
                    var center = sales.SalesSub.Where(x => x.rank >= (int)SalesRankState.operationsCenter).Traverse(x => x.SalesSub).ToList();
                    int recommend_center_kv_total = 0;//直推營運中心總營業kv

                    #region 取得下線總營業kv
                    foreach (var c in center)
                    {
                        //計算營運中心或下線的該月消費
                        int? sub_kv_total = c.Purchase.Where(x => x.set_date.Year == y & x.set_date.Month == m & x.state == (int)PurchaseState.complete).Sum(x => x.kv_total);
                        recommend_center_kv_total += (int)sub_kv_total;
                    }

                    #endregion

                    info.recommend_center_kv_total = recommend_center_kv_total;
                    if (kv_total >= 1000 & count_manager >= 30)
                    {
                        //營運中心紅利獎金(等級為管理處算法不同)
                        info.center_bonus = Convert.ToInt32((AllLine_kv_total - recommend_center_kv_total) * 0.02);
                        //管理處紅利-個人消費滿1000kv且30位經理人合格
                        info.office_bonus = Convert.ToInt32(recommend_center_kv_total * 0.01);
                    }
                }

                #endregion
            }
            return info;
        }
        public class SettleSelfInfo
        {
            public int kv_total { get; set; }
            public int share_kv_total { get; set; }
            public int recommend_kv_total { get; set; }
            public int AllLine_kv_total { get; set; }
            public int recommend_center_kv_total { get; set; }
            public int count_manager { get; set; }//計算直推經理人幾位合格
            public int b { get; set; }//累計回饋
            //個人獎金
            public int self_bonus { get; set; }
            //經理人獎金
            public int manager_bonus { get; set; }
            //營運中心獎金
            public int center_bonus { get; set; }
            //管理處獎金
            public int office_bonus { get; set; }
        }
        #endregion

        #region 一般會員檢視_共享圈
        /// <summary>
        /// 顯示安置人
        /// </summary>
        /// <param name="share_no"></param>
        /// <param name="sales_no"></param>
        /// <returns></returns>
        public SalesTree GetShareBySalesSelf(string share_no, string sales_no)
        {

            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                var share_sales = db0.Sales.Find(share_no);
                var data = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level > sales.share_level & x.share_level < (sales.share_level + 4)).ToList();

                //安置人
                SalesTree share = new SalesTree()
                {
                    sales_no = share_no,
                    sales_name = share_sales.sales_name,
                    sub = null
                };
                //自己
                SalesTree n = new SalesTree()
                {
                    sales_no = sales_no,
                    sales_name = sales.sales_name,
                    sub = null
                };

                IList<SalesTree> Share_n = new List<SalesTree>() { n };
                share.sub = Share_n;
                share.sub_count = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level > sales.share_level & x.share_level <= (sales.share_level + 4)).Count();

                IList<SalesTree> L = new List<SalesTree>();
                foreach (var t in sales.ShareSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sub = null
                    };

                    var k = QSub(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;
                    L.Add(m);
                }
                n.sub_count = L.Count();
                n.sub = L;
                return share;
            }

        }

        /// <summary>
        /// 顯示每個會員當月及上月 kv_total total
        /// </summary>
        /// <param name="share_no"></param>
        /// <param name="sales_no"></param>
        /// <returns></returns>
        public SalesTree GetShareBykv(string sales_no)
        {

            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                var data = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level > sales.share_level & x.share_level < (sales.share_level + 4)).ToList();


                SalesTree n = new SalesTree()
                {
                    sales_no = sales_no,
                    sales_name = sales.sales_name,
                    sub = null
                };

                n.sub_count = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level > sales.share_level & x.share_level <= (sales.share_level + 4)).Count();
                #region get kv、total
                DateTime now = DateTime.Now;
                DateTime past = now.AddMonths(-1);
                var thisMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                            x.set_date.Year == now.Year &
                                                            x.set_date.Month == now.Month &
                                                            x.state == (int)PurchaseState.complete).ToList();
                var lastMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                              x.set_date.Year == past.Year &
                                                              x.set_date.Month == past.Month &
                                                              x.state == (int)PurchaseState.complete).ToList();
                n.kv_total = (int)thisMonth.Sum(x => x.kv_total);
                n.total = (int)thisMonth.Sum(x => x.total);
                n.last_kv_total = (int)lastMonth.Sum(x => x.kv_total);
                n.last_total = (int)lastMonth.Sum(x => x.total);
                #endregion
                IList<SalesTree> L = new List<SalesTree>();
                foreach (var t in sales.ShareSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sub = null
                    };

                    var k = QSubBykv(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;
                    #region get kv、total
                    var subthisMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == now.Year &
                                                             x.set_date.Month == now.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    var sublastMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == past.Year &
                                                             x.set_date.Month == past.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    m.kv_total = (int)subthisMonth.Sum(x => x.kv_total);
                    m.total = (int)subthisMonth.Sum(x => x.total);
                    m.last_kv_total = (int)sublastMonth.Sum(x => x.kv_total);
                    m.last_total = (int)sublastMonth.Sum(x => x.total);
                    #endregion
                    L.Add(m);
                }
                //n.sub_count = L.Count();
                n.sub = L;
                return n;
            }
        }
        private SalesTree[] QSubBykv(string sales_no, IEnumerable<Sales> data)
        {
            IList<SalesTree> L = new List<SalesTree>();

            var f = data.FirstOrDefault(x => x.sales_no == sales_no);
            DateTime now = DateTime.Now;
            DateTime past = now.AddMonths(-1);
            if (f != null)
            {
                foreach (var t in f.ShareSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sub = null
                    };

                    var k = QSubBykv(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;

                    #region get kv、total
                    var subthisMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == now.Year &
                                                             x.set_date.Month == now.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    var sublastMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == past.Year &
                                                             x.set_date.Month == past.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    m.kv_total = (int)subthisMonth.Sum(x => x.kv_total);
                    m.total = (int)subthisMonth.Sum(x => x.total);
                    m.last_kv_total = (int)sublastMonth.Sum(x => x.kv_total);
                    m.last_total = (int)sublastMonth.Sum(x => x.total);
                    #endregion
                    L.Add(m);
                }
            }

            return L.ToArray();
        }
        #endregion

        #region 經理人檢視_推薦人
        /// <summary>
        /// 僅檢視直接推薦人,不檢視推薦人下線
        /// </summary>
        /// <param name="sales_no"></param>
        /// <returns></returns>
        public SalesTree GetRemmonedBySalesSelf(string sales_no)
        {

            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);

                SalesTree n = new SalesTree()
                {
                    sales_no = sales_no,
                    sales_name = sales.sales_name,
                    sales_rank = sales.rank,
                    sub = null
                };

                n.sub_count = sales.SalesSub.Count();
                #region get kv、total
                DateTime now = DateTime.Now;
                DateTime past = now.AddMonths(-1);
                var thisMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                            x.set_date.Year == now.Year &
                                                            x.set_date.Month == now.Month &
                                                            x.state == (int)PurchaseState.complete).ToList();
                var lastMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                              x.set_date.Year == past.Year &
                                                              x.set_date.Month == past.Month &
                                                              x.state == (int)PurchaseState.complete).ToList();
                n.kv_total = (int)thisMonth.Sum(x => x.kv_total);
                n.total = (int)thisMonth.Sum(x => x.total);
                n.last_kv_total = (int)lastMonth.Sum(x => x.kv_total);
                n.last_total = (int)lastMonth.Sum(x => x.total);
                #endregion
                IList<SalesTree> L = new List<SalesTree>();
                foreach (var t in sales.SalesSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sales_rank = t.rank,
                        sub = new List<SalesTree>()
                    };

                    #region get kv、total
                    var subthisMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == now.Year &
                                                             x.set_date.Month == now.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    var sublastMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == past.Year &
                                                             x.set_date.Month == past.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    m.kv_total = (int)subthisMonth.Sum(x => x.kv_total);
                    m.total = (int)subthisMonth.Sum(x => x.total);
                    m.last_kv_total = (int)sublastMonth.Sum(x => x.kv_total);
                    m.last_total = (int)sublastMonth.Sum(x => x.total);
                    #endregion
                    L.Add(m);
                }
                n.sub = L;
                return n;
            }
        }
        /// <summary>
        /// 推薦人及其下線
        /// </summary>
        /// <param name="sales_no"></param>
        /// <returns></returns>
        public SalesTree GetRemmonedBySales(string sales_no)
        {

            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                var data = sales.SalesSub.Traverse(x => x.SalesSub).ToList();

                SalesTree n = new SalesTree()
                {
                    sales_no = sales_no,
                    sales_name = sales.sales_name,
                    sales_rank = sales.rank,
                    sub = null
                };

                n.sub_count = sales.SalesSub.Count();
                #region get kv、total
                DateTime now = DateTime.Now;
                DateTime past = now.AddMonths(-1);
                var thisMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                            x.set_date.Year == now.Year &
                                                            x.set_date.Month == now.Month &
                                                            x.state == (int)PurchaseState.complete).ToList();
                var lastMonth = sales.Purchase.Where(x => x.sales_no == sales_no &
                                                              x.set_date.Year == past.Year &
                                                              x.set_date.Month == past.Month &
                                                              x.state == (int)PurchaseState.complete).ToList();
                n.kv_total = (int)thisMonth.Sum(x => x.kv_total);
                n.total = (int)thisMonth.Sum(x => x.total);
                n.last_kv_total = (int)lastMonth.Sum(x => x.kv_total);
                n.last_total = (int)lastMonth.Sum(x => x.total);
                #endregion
                IList<SalesTree> L = new List<SalesTree>();
                foreach (var t in sales.SalesSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sales_rank = t.rank,
                        sub = null
                    };
                    var k = QSubBySales(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;
                    #region get kv、total
                    var subthisMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == now.Year &
                                                             x.set_date.Month == now.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    var sublastMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == past.Year &
                                                             x.set_date.Month == past.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    m.kv_total = (int)subthisMonth.Sum(x => x.kv_total);
                    m.total = (int)subthisMonth.Sum(x => x.total);
                    m.last_kv_total = (int)sublastMonth.Sum(x => x.kv_total);
                    m.last_total = (int)sublastMonth.Sum(x => x.total);
                    #endregion
                    L.Add(m);
                }
                n.sub = L;
                return n;
            }
        }

        private SalesTree[] QSubBySales(string sales_no, IEnumerable<Sales> data)
        {
            IList<SalesTree> L = new List<SalesTree>();

            var f = data.FirstOrDefault(x => x.sales_no == sales_no);
            DateTime now = DateTime.Now;
            DateTime past = now.AddMonths(-1);
            if (f != null)
            {
                foreach (var t in f.SalesSub)
                {
                    var m = new SalesTree()
                    {
                        sales_no = t.sales_no,
                        sales_name = t.sales_name,
                        sales_rank = t.rank,
                        sub = null
                    };

                    var k = QSubBySales(t.sales_no, data);
                    m.sub = k;
                    m.sub_count = k.Length;

                    #region get kv、total
                    var subthisMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == now.Year &
                                                             x.set_date.Month == now.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    var sublastMonth = t.Purchase.Where(x => x.sales_no == t.sales_no &
                                                             x.set_date.Year == past.Year &
                                                             x.set_date.Month == past.Month &
                                                             x.state == (int)PurchaseState.complete).ToList();
                    m.kv_total = (int)subthisMonth.Sum(x => x.kv_total);
                    m.total = (int)subthisMonth.Sum(x => x.total);
                    m.last_kv_total = (int)sublastMonth.Sum(x => x.kv_total);
                    m.last_total = (int)sublastMonth.Sum(x => x.total);
                    #endregion
                    L.Add(m);
                }
            }

            return L.ToArray();
        }
        #endregion

        #region 三元樹走訪(更新Share_level)
        public void GetPreOrderLevel(string sales_no)
        {
            using (db0 = getDB0)
            {
                var sales = db0.Sales.Find(sales_no);
                var data = sales.ShareSub
                    .Traverse(x => x.ShareSub).Where(x => x.share_level >= sales.share_level).ToList();

                foreach (var t in sales.ShareSub)
                {
                    t.share_level = sales.share_level + 1;

                    TreeSub(t.sales_no, data);
                }

                db0.SaveChanges();
            }
        }
        private void TreeSub(string sales_no, IEnumerable<Sales> data)
        {
            var f = data.FirstOrDefault(x => x.sales_no == sales_no);
            if (f != null)
            {
                foreach (var t in f.ShareSub)
                {
                    t.share_level = f.share_level + 1;

                    TreeSub(t.sales_no, data);
                }
            }
        }
        #endregion

        public class SalesTree
        {
            public string sales_no { get; set; }
            public string sales_name { get; set; }
            public IList<SalesTree> sub { get; set; }
            public int sub_count { get; set; }
            public bool is_me { get; set; }

            public int kv_total { get; set; }
            public int total { get; set; }
            public int last_kv_total { get; set; }
            public int last_total { get; set; }
            public int sales_rank { get; set; }
        }


    }
    public class ReportCenter : LogicCenter
    {
        public ReportCenter() : base() { }
        public ReportCenter(string config_string)
            : base(config_string)
        {
            this.db0 = getDB0;
        }

    }
}