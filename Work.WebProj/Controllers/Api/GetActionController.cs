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

        /// <summary>
        /// 後台分類管理-更新排序
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [HttpPost]
        public ResultInfo updateCategorySort([FromBody]CategroySortParm parm)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                using (var db0 = getDB0())
                {
                    foreach (var q in parm.SortData)
                    {
                        var item = db0.All_Category_L2.Find(q.id);
                        item.sort = q.sort;
                    }
                    db0.SaveChanges();
                }

                rAjaxResult.result = true;
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
            }
            return rAjaxResult;
        }
        /// <summary>
        /// 後台分類管理-取得分類資料
        /// </summary>
        /// <param name="q"></param>
        /// <returns></returns>
        public IHttpActionResult GetCategoryData([FromUri]GetCategoryDataParm q)
        {
            try
            {
                using (var db0 = getDB0())
                {
                    var options_category = db0.All_Category_L2.Where(x => x.all_category_l1_id == q.l1_id & !x.i_Hide)
                                                                       .OrderByDescending(x => x.sort)
                                                                       .GroupBy(x => x.i_Lang)
                                                                       .Select(x => new { lang = x.Key, items = x.Select(y => new option() { val = y.all_category_l2_id, Lname = y.l2_name }) }).ToList();

                    return Ok(new { result = true, data = options_category });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { result = true, message = ex.ToString() });
            }
        }

        #region 後台-產品分類
        public IHttpActionResult GetPorductCategoryL1()
        {
            try
            {
                using (var db0 = getDB0())
                {
                    var options_category = db0.Product_Category_L1.Where(x => !x.i_Hide)
                                                                       .OrderByDescending(x => x.l1_sort)
                                                                       .GroupBy(x => x.i_Lang)
                                                                       .Select(x => new { lang = x.Key, items = x.Select(y => new option() { val = y.product_category_l1_id, Lname = y.l1_name }) }).ToList();

                    return Ok(new { result = true, data = options_category });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { result = true, message = ex.ToString() });
            }
        }
        public IHttpActionResult GetPorductCategoryL2()
        {
            try
            {
                using (var db0 = getDB0())
                {
                    var options_category = db0.Product_Category_L1.Where(x => !x.i_Hide)
                                                                       .OrderByDescending(x => x.l1_sort)
                                                                       .GroupBy(x => x.i_Lang)
                                                                       .Select(x => new
                                                                       {
                                                                           lang = x.Key,
                                                                           items = x.Select(y => new L1()
                                                                           {
                                                                               l1_id = y.product_category_l1_id,
                                                                               l1_name = y.l1_name,
                                                                               l2_list = y.Product_Category_L2.OrderByDescending(z => z.l2_sort)
                                                                                        .Where(z => !z.i_Hide & z.i_Lang == x.Key)
                                                                                        .Select(z => new L2() { l2_id = z.product_category_l2_id, l2_name = z.l2_name }).ToList()
                                                                           })
                                                                       }).ToList();

                    return Ok(new { result = true, data = options_category });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { result = true, message = ex.ToString() });
            }
        }
        #endregion
        #region 後台-參數設定
        [HttpPost]
        public ResultInfo PostAboutUs([FromBody]AboutUsParm md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                var open = openLogic();
                md.aboutus = RemoveScriptTag(md.aboutus);//移除script標籤

                //open.setParmValue(ParmDefine.AboutUs, md.aboutus);

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

    }
    #region Parm

    public class AboutUsParm
    {
        public string aboutus { get; set; }
    }
    public class CategroySort
    {
        public int id { get; set; }
        public int sort { get; set; }
    }
    public class GetCategoryDataParm
    {
        public int l1_id { get; set; }
    }
    public class CategroySortParm
    {
        public IList<CategroySort> SortData { get; set; }
    }
    #endregion
}
