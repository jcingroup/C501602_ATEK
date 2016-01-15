using DotWeb.WebApp.Models;
using ProcCore.Business.LogicConect;
using ProcCore.HandleResult;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json;
using System.IO;
using ProcCore.Business.DB0;
using ProcCore;
using DotWeb.CommSetup;
using System.Web;
using ProcCore.WebCore;
using DotWeb.Helpers;

namespace DotWeb.Api
{
    public class GetActionController : ajaxBaseApi
    {
        public async Task<IHttpActionResult> GetInsertRoles()
        {
            var system_roles = await roleManager.Roles.Where(x => x.Name != "Admins").ToListAsync();
            IList<UserRoleInfo> obj = new List<UserRoleInfo>();
            foreach (var role in system_roles)
            {
                obj.Add(new UserRoleInfo() { role_id = role.Id, role_name = role.Name, role_use = false });
            }
            return Ok(obj);
        }
        public async Task<IHttpActionResult> GetModalQuerySales(string keyword)
        {
            using (db0 = getDB0())
            {
                if (keyword != null)
                {
                    var items = await db0.Sales.Where(x => x.sales_name.StartsWith(keyword) || x.sales_no.StartsWith(keyword))
                        .Select(x => new { x.sales_id, x.sales_no, x.sales_name, x.join_date })
                        .ToListAsync();
                    return Ok(items);
                }
                else
                {
                    var items = await db0.Sales
                        .Select(x => new { x.sales_id, x.sales_no, x.sales_name, x.join_date })
                        .ToListAsync();
                    return Ok(items);
                }
            }
        }
        public async Task<IHttpActionResult> GetModalQueryProduct(string keyword)
        {
            using (db0 = getDB0())
            {
                if (keyword != null)
                {
                    var items = await db0.Product.Where(x => x.product_name.Contains(keyword))
                        .Select(x => new { x.product_no, x.product_name, x.price, x.kvalue })
                        .ToListAsync();
                    return Ok(items);
                }
                else
                {
                    var items = await db0.Product
                        .Select(x => new { x.product_no, x.product_name, x.price, x.kvalue })
                        .ToListAsync();
                    return Ok(items);
                }
            }
        }
        public async Task<IHttpActionResult> GetMenuQuery()
        {
            if (UserId == null)
                return null;

            ObjectCache cache = MemoryCache.Default;
            string cache_name = "m." + UserId;
            string json_context = (string)cache[cache_name];
            string path = System.Web.Hosting.HostingEnvironment.MapPath(string.Format("/_code/cache/m.{0}.json", UserId));

            if (json_context == null)
            {
                #region data access
                db0 = getDB0();
                IList<MenuDef> m1 = new List<MenuDef>();
                var menus = await db0.Menu.Where(x => x.is_use == true).ToListAsync();
                foreach (var menu in menus)
                {
                    var menu_roles = menu.AspNetRoles.Select(x => x.Id).ToList();
                    bool exits;
                    if (UserRoles.Any(x => x == "7b556351-4072-465b-8cf1-f02fa28ba3ca"))
                    {
                        exits = true;
                    }
                    else
                    {
                        exits = menu_roles.Intersect(UserRoles).Any(); //檢查 User roles是否與 menu roles是否有交集
                    }

                    if (exits)
                    {
                        var o = new MenuDef();
                        o.Area = menu.area == null ? string.Empty : menu.area;
                        o.Controller = menu.controller == null ? string.Empty : menu.controller;
                        o.Action = menu.action == null ? string.Empty : menu.action;

                        o.Title = menu.menu_name;
                        o.Clickable = !menu.is_folder;
                        o.Key = menu.menu_id;
                        o.ParentKey = menu.parent_menu_id;
                        o.sort = menu.sort;
                        o.Checked = false;
                        o.IconClass = menu.icon_class;
                        m1.Add(o);
                    }
                }
                db0.Dispose();
                #endregion

                //樹狀處理
                //var t1 = m1.Where(x => x.ParentKey == 0).OrderBy(x => x.sort);
                //foreach (var t2 in t1)
                //{
                //    t2.sub = ReMarkMenuTree(t2, m1);
                //}
                var result_obj = m1.OrderBy(x => x.sort);

                json_context = JsonConvert.SerializeObject(result_obj,
                    new JsonSerializerSettings()
                    {
                        NullValueHandling = NullValueHandling.Ignore
                    }
                    );
                File.WriteAllText(path, json_context);

                IList<string> paths = new List<string>();
                paths.Add(path);

                CacheItemPolicy policy = new CacheItemPolicy();
                policy.AbsoluteExpiration = DateTimeOffset.Now.AddHours(1);
                policy.ChangeMonitors.Add(new HostFileChangeMonitor(paths));
                cache.Set(cache_name, json_context, policy);

                return Ok(result_obj);
            }
            else
            {
                var result_obj = JsonConvert.DeserializeObject<IList<MenuDef>>(json_context);
                return Ok(result_obj);
            }
        }
        private IList<MenuDef> ReMarkMenuTree(MenuDef t2, IList<MenuDef> data)
        {
            var t3 = data.Where(x => x.ParentKey == t2.Key);
            IList<MenuDef> s = new List<MenuDef>();
            if (!t3.Any())
            {
                return s;
            }

            foreach (var t4 in t3)
            {
                t4.sub = ReMarkMenuTree(t4, data);
            }
            return t3.ToList();
        }
        public async Task<IHttpActionResult> GetProductNoExist(string no)
        {
            using (db0 = getDB0())
            {
                var r = await db0.Product.AnyAsync(x => x.product_no == no);
                return Ok(r);
            }
        }
        [HttpPost]
        public ResultInfo SettleCal(SettleCal parm)
        {
            var logic = openLogic();
            var r = logic.SettleCalVerion2(parm.y, parm.m);

            return r;
        }
        private class SalesCalInfo
        {
            public string sales_no { get; set; }
            public string sales_name { get; set; }
            public byte rank { get; set; }
            public string share_sn { get; set; }
            public string share_name { get; set; }
            public int share_level { get; set; }
        }
        /// <summary>
        /// 確認獎金結算
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ResultInfo setSettleState(int id)
        {
            var logic = openLogic();

            using (var db0 = getDB0())
            {
                var getSettle = db0.Settle.Find(id);
                var r = logic.SettleCalVerion2(getSettle.y, getSettle.m);
                getSettle.state = (int)SettleState.complete;
                db0.SaveChanges();
                return r;
            }
        }
        /// <summary>
        /// 初始設定累積回饋獎金
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IHttpActionResult> setSettleDetailBVal(int id, int b)
        {
            using (var db0 = getDB0())
            {
                var getDetail = await db0.SettleDetail.FindAsync(id);
                getDetail.b = b;
                await db0.SaveChangesAsync();

                return Ok(true);
            }
        }

        [HttpGet]
        public LogicCenter.SalesTree GetShareBySales(string sales_no)
        {
            //以下要從會員的推薦人查詢共享圈成員
            db0 = getDB0();
            var sales = db0.Sales.Find(sales_no);
            var logic = openLogic();
            var r = logic.GetShareBySales(sales.recommend_no, sales_no);

            return r;
        }

        [HttpGet]
        public LogicCenter.SalesTree GetShareBySales_View(string sales_no)
        {
            //以下要從會員的安置人查詢共享圈成員
            db0 = getDB0();
            var sales = db0.Sales.Find(sales_no);
            var logic = openLogic();
            var r = logic.GetShareBySalesSelf(sales.share_sn, sales_no);

            return r;
        }
        [HttpGet]
        public LogicCenter.SalesTree GetShareBySales_kv(string sales_no)
        {
            //以下要從會員查詢共享圈成員及每個成員的消費金額、kv
            db0 = getDB0();
            var sales = db0.Sales.Find(sales_no);
            var logic = openLogic();
            var r = logic.GetShareBykv(sales_no);

            return r;
        }
        [HttpGet]
        public LogicCenter.SalesTree GetRemmonedBySalesSelf(string sales_no)
        {
            //以下要從會員查詢推薦成員及每個成員的消費金額、kv
            db0 = getDB0();
            var sales = db0.Sales.Find(sales_no);
            var logic = openLogic();
            var r = logic.GetRemmonedBySalesSelf(sales_no);

            return r;
        }
        [HttpGet]
        public LogicCenter.SalesTree GetRemmonedBySales(string sales_no)
        {
            //以下要從會員查詢所有下線成員及每個成員的消費金額、kv
            db0 = getDB0();
            var sales = db0.Sales.Find(sales_no);
            var logic = openLogic();
            var r = logic.GetRemmonedBySales(sales_no);

            return r;
        }
        [HttpGet]
        public void GetNewTreeLevel()
        {
            //以下要從會員(紘網文創有限公司)來更新會員的share_level編號
            db0 = getDB0();
            var logic = openLogic();
            logic.GetPreOrderLevel("A034689493");
        }

        [HttpPut]
        public async Task<IHttpActionResult> PutSalesSite([FromBody]PutSalesSiteParms md)
        {
            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            try
            {
                var sales_site = await db0.Sales.FindAsync(md.sales_no);
                var sales_share = await db0.Sales.FindAsync(md.share_sn);
                var line_count = db0.Sales.Where(x => x.share_sn == md.share_sn).Count();
                sales_site.share_sn = md.share_sn;

                sales_site.share_level = sales_share.share_level + 1;
                sales_site.share_sort = System.Convert.ToByte(line_count + 1);
                await db0.SaveChangesAsync();

                #region 更新下層share_level
                var logic = openLogic();
                logic.GetPreOrderLevel(md.sales_no);
                #endregion

                r.result = true;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
            }
            finally
            {
                db0.Dispose();
            }
            return Ok(r);
        }
        public class PutSalesSiteParms
        {
            public string sales_no { get; set; }
            public string share_sn { get; set; }
        }

        [HttpGet]
        public async Task<IHttpActionResult> ta_Product(string keyword)
        {
            db0 = getDB0();
            var item = await db0.Product
                .OrderBy(x => x.product_no)
                .Where(x => (x.product_no.StartsWith(keyword) || x.product_name.Contains(keyword)) & !x.state)
                .Select(x => new { value = x.product_no, text = x.product_name })
                .Take(5).ToListAsync();

            return Ok(item);
        }
        #region 後台-參數設定
        [HttpPost]
        public ResultInfo PostAboutUs([FromBody]AboutUsParm md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                var open = openLogic();
                md.aboutus = RemoveScriptTag(md.aboutus);//移除script標籤

                open.setParmValue(ParmDefine.AboutUs, md.aboutus);

                rAjaxResult.result = true;
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
            }
            return rAjaxResult;
        }
        public ResultInfo PostParamData([FromBody]Param md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                var open = openLogic();

                open.setParmValue(ParmDefine.Email, md.Email);

                open.setParmValue(ParmDefine.PurchaseTotal, md.PurchaseTotal);
                open.setParmValue(ParmDefine.HomoiothermyFee, md.HomoiothermyFee);
                open.setParmValue(ParmDefine.RefrigerFee, md.RefrigerFee);

                open.setParmValue(ParmDefine.AccountName, md.AccountName);
                open.setParmValue(ParmDefine.BankName, md.BankName);
                open.setParmValue(ParmDefine.BankCode, md.BankCode);
                open.setParmValue(ParmDefine.AccountNumber, md.AccountNumber);
                open.setParmValue(ParmDefine.Fee, md.Fee);

                rAjaxResult.result = true;
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
            }
            return rAjaxResult;
        }
        #endregion
        /// <summary>
        /// 後台重設密碼
        /// </summary>
        /// <param name="id">會員編號</param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IHttpActionResult> resetPasswrod(string id)
        {
            try
            {
                db0 = getDB0();
                var item = await db0.Sales.FindAsync(id);
                item.password = HttpUtility.UrlEncode(EncryptString.desEncryptBase64(CommWebSetup.DEV_MemberPWD));
                db0.SaveChanges();
                return Ok(true);
            }
            catch (Exception ex)
            {
                return Ok(false);
            }
        }

        #region 後台-產品資料設定(熱門商品、銷售排行)
        [HttpPut]
        public ResultInfo SetProductHot([FromBody]ProductSet q)
        {
            using (db0 = getDB0())
            {
                var item = db0.Product.Find(q.product_no);
                item.is_Hot = q.val;
                db0.SaveChanges();
                var r = new ResultInfo() { result = true };
                return r;
            }
        }
        [HttpPut]
        public ResultInfo SetProductTop([FromBody]ProductSet q)
        {
            using (db0 = getDB0())
            {
                var item = db0.Product.Find(q.product_no);
                item.is_TopSales = q.val;
                db0.SaveChanges();
                var r = new ResultInfo() { result = true };
                return r;
            }
        }
        #endregion
        #region 後台-會員可晉升名單
        public IHttpActionResult GetRiseRankData([FromUri]RiseRankParm q)
        {
            try
            {
                List<m_Sales> r = new List<m_Sales>();
                using (var db0 = getDB0())
                {
                    //只要階級為共享會員皆可晉升為經理人
                    var getM = db0.Sales.Where(x => x.rank == (int)SalesRankState.general & x.SalesSub.Count() >= 3).OrderBy(x => x.sales_no)
                                                  .Select(x => new m_Sales()
                                                  {
                                                      sales_id = x.sales_id,
                                                      sales_no = x.sales_no,
                                                      rank = x.rank,
                                                      sales_name = x.sales_name,
                                                      join_date = x.join_date,
                                                      rise_type = (int)SalesRiseRankType.generalToManager
                                                  }).ToList();

                    var getO = db0.Sales.Where(x => x.rank == (int)SalesRankState.manager &
                                                    x.SalesSub.Where(y => y.rank == (int)SalesRankState.manager &
                                                                          y.Purchase.Where(z => z.set_date.Year == DateTime.Now.Year & z.set_date.Month == DateTime.Now.Month).Sum(z => z.total) > 0).Count() >= 30)
                                        .OrderBy(x => x.sales_no)
                                                  .Select(x => new m_Sales()
                                                  {
                                                      sales_id = x.sales_id,
                                                      sales_no = x.sales_no,
                                                      rank = x.rank,
                                                      sales_name = x.sales_name,
                                                      join_date = x.join_date,
                                                      rise_type = (int)SalesRiseRankType.managerToOperationsCenter
                                                  }).ToList();
                    var getMO = db0.Sales.Where(x => x.rank == (int)SalesRankState.operationsCenter &
                                                      x.SalesSub.Where(y => y.rank == (int)SalesRankState.operationsCenter).Count() >= 3)
                                        .OrderBy(x => x.sales_no)
                                                  .Select(x => new m_Sales()
                                                  {
                                                      sales_id = x.sales_id,
                                                      sales_no = x.sales_no,
                                                      rank = x.rank,
                                                      sales_name = x.sales_name,
                                                      join_date = x.join_date,
                                                      rise_type = (int)SalesRiseRankType.operationsCenterToManagerOffice
                                                  }).ToList();
                    r.AddRange(getM);
                    r.AddRange(getO);
                    r.AddRange(getMO);

                    if (q.rise_type != null)
                    {
                        r = r.Where(x => x.rise_type == q.rise_type).ToList();
                    }

                    int page = (q.page == null ? 1 : (int)q.page);
                    int startRecord = PageCount.PageInfo(page, this.defPageSize, r.Count());
                    var resultItems = r.Skip(startRecord).Take(this.defPageSize).ToList();

                    return Ok(new RankGirdInfo<m_Sales>()
                    {
                        rows = resultItems,
                        total = PageCount.TotalPage,
                        page = PageCount.Page,
                        records = PageCount.RecordCount,
                        startcount = PageCount.StartCount,
                        endcount = PageCount.EndCount
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(ex.ToString());
            }


        }
        [HttpPut]
        public ResultInfo SetSalesRank([FromBody]setSalesRank q)
        {
            using (db0 = getDB0())
            {
                var item = db0.Sales.Find(q.no);
                if (item.rank != (int)SalesRankState.managementOffice)
                {
                    if (q.rise_type == (int)SalesRiseRankType.generalToManager)
                    {
                        item.rank = (int)SalesRankState.manager;
                    }
                    else if (q.rise_type == (int)SalesRiseRankType.managerToOperationsCenter)
                    {
                        item.rank = (int)SalesRankState.operationsCenter;
                    }
                    else if (q.rise_type == (int)SalesRiseRankType.operationsCenterToManagerOffice)
                    {
                        item.rank = (int)SalesRankState.managementOffice;
                    }
                }

                db0.SaveChanges();
                var r = new ResultInfo() { result = true };
                return r;
            }
        }
        #endregion
        #region 後台(一般會員)
        //個人消費紀錄統計
        public async Task<IHttpActionResult> GetSalesPurchaseInfo()
        {

            try
            {
                db0 = getDB0();
                var open = openLogic();
                #region 當月及上月個人消費紀錄
                DateTime now = DateTime.Now;
                DateTime past = now.AddMonths(-1);
                var items = await db0.Purchase.Where(x => x.sales_no == this.UserId & x.state == (int)PurchaseState.complete).ToListAsync();

                var thisMonth = items.Where(x => x.set_date.Year == now.Year & x.set_date.Month == now.Month).ToList();
                var lastMonth = items.Where(x => x.set_date.Year == past.Year & x.set_date.Month == past.Month).ToList();
                PurchaseCount item = new PurchaseCount();
                item.total = thisMonth.Sum(x => x.total);
                item.kv_total = thisMonth.Sum(x => x.kv_total);
                item.last_total = lastMonth.Sum(x => x.total);
                item.last_kv_total = lastMonth.Sum(x => x.kv_total);
                #endregion

                #region 萬客摩匯款帳號
                Param param = new Param();
                param.AccountName = (string)open.getParmValue(ParmDefine.AccountName);
                param.BankName = (string)open.getParmValue(ParmDefine.BankName);
                param.BankCode = (string)open.getParmValue(ParmDefine.BankCode);
                param.AccountNumber = (string)open.getParmValue(ParmDefine.AccountNumber);
                #endregion


                return Ok(new
                {
                    result = true,
                    item = item,
                    param = param
                });
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, message = ex.ToString() });
            }
        }

        [HttpGet]
        public LogicCenter.SettleSelfInfo GetSalesSelfBonus(int y, int m)
        {
            //取得會員獎金
            db0 = getDB0();
            var logic = openLogic();
            var r = logic.SettleSelf(y, m, this.UserId);

            return r;
        }
        #endregion
    }
    #region Parm
    public class SettleCal
    {
        public int id { get; set; }
        public int y { get; set; }
        public int m { get; set; }
    }
    public class AboutUsParm
    {
        public string aboutus { get; set; }
    }
    public class ProductSet
    {
        public string product_no { get; set; }
        public bool val { get; set; }
    }
    public class RiseRankParm
    {
        public int? rise_type { get; set; }
        public int? page { get; set; }
    }
    public class RankGirdInfo<R>
    {
        public List<R> rows { get; set; }
        public int total { get; set; }
        public int page { get; set; }
        public int records { get; set; }
        public int startcount { get; set; }
        public int endcount { get; set; }
    }
    public class setSalesRank
    {
        public string no { get; set; }
        public int rise_type { get; set; }
    }
    public class PurchaseCount
    {
        public int total { get; set; }
        public int? kv_total { get; set; }
        public int last_total { get; set; }
        public int? last_kv_total { get; set; }
    }
    #endregion
}
