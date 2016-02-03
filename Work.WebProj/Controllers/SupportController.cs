
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;

namespace DotWeb.WebApp.Controllers
{
    public class SupportController : WebUserController
    {
        // GET: Support
        public ActionResult Index(int? category)
        {
            SupportInfo info = new SupportInfo();
            using (var db0 = getDB0())
            {
                #region get content
                info.items = db0.Support.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderByDescending(x => new { x.sort, x.day })
                                         .Select(x => new m_Support()
                                         {
                                             support_id = x.support_id,
                                             support_title = x.support_title,
                                             support_content = x.support_content,
                                             day = x.day,
                                             support_category = x.support_category
                                         }).ToList();
                if (category != null)
                {
                    info.items = info.items.Where(x => x.support_category == category).ToList();
                }
                foreach (var i in info.items)
                {
                    i.fileSrc = GetFile(i.support_id.ToString(), "File1", "Active", "SupportData");
                }
                #endregion
                #region get category
                info.category = db0.All_Category_L2.Where(x => !x.i_Hide & x.all_category_l1_id == (int)AllCategoryType.Support & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name)
                                                 .OrderByDescending(x => x.sort)
                                                 .Select(x => new L2()
                                                 {
                                                     l2_id = x.all_category_l2_id,
                                                     l2_name = x.l2_name
                                                 }).ToList();
                #endregion
            }
            ViewBag.category = category;
            return View("Support", info);
        }
    }
    public class SupportInfo
    {
        public List<m_Support> items { get; set; }
        public List<L2> category { get; set; }
    }
}