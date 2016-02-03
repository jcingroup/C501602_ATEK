using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;

namespace DotWeb.WebApp.Controllers
{
    public class NewsController : WebUserController
    {
        // GET: News
        public ActionResult Index(int? category)
        {
            NewsInfo info = new NewsInfo();
            using (var db0 = getDB0())
            {
                #region get content
                info.items = db0.News.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderByDescending(x => new { x.sort, x.day })
                                         .Select(x => new m_News()
                                         {
                                             news_id = x.news_id,
                                             news_title = x.news_title,
                                             news_info = x.news_info,
                                             day = x.day,
                                             news_category = x.news_category
                                         }).ToList();
                if (category != null)
                {
                    info.items = info.items.Where(x => x.news_category == category).ToList();
                }
                #endregion
                #region get category
                info.category = db0.All_Category_L2.Where(x => !x.i_Hide & x.all_category_l1_id == (int)AllCategoryType.News & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name)
                                                 .OrderByDescending(x => x.sort)
                                                 .Select(x => new L2()
                                                 {
                                                     l2_id = x.all_category_l2_id,
                                                     l2_name = x.l2_name
                                                 }).ToList();
                #endregion
                var category_obj = info.category.Where(x => x.l2_id == category).FirstOrDefault();
                if (category_obj == null & category != null)
                {
                    return Redirect("~/News");
                }
                else if (category_obj != null)
                {
                    ViewBag.l2_name = category_obj.l2_name;
                }
                else {
                    ViewBag.l2_name = "ALL";
                }
                ViewBag.category = category;
            }
            return View("list", info);
        }
        public ActionResult content(int? id)
        {
            NewsContent content = new NewsContent();
            using (var db0 = getDB0())
            {
                #region get content
                bool Exist = db0.News.Any(x => x.news_id == id && !x.i_Hide);
                if (id == null || !Exist)
                {
                    return Redirect("~/News");
                }
                else
                {
                    content.item = db0.News.Find(id);
                    #region get category
                    content.category = db0.All_Category_L2.Where(x => !x.i_Hide & x.all_category_l1_id == (int)AllCategoryType.News & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name)
                                                     .OrderByDescending(x => x.sort)
                                                     .Select(x => new L2()
                                                     {
                                                         l2_id = x.all_category_l2_id,
                                                         l2_name = x.l2_name
                                                     }).ToList();
                    #endregion
                }
                #endregion
            }
            ViewBag.category = content.item.news_category;
            return View(content);
        }
    }
    public class NewsInfo
    {
        public List<m_News> items { get; set; }
        public List<L2> category { get; set; }
    }
    public class NewsContent
    {
        public News item { get; set; }
        public List<L2> category { get; set; }
    }
}