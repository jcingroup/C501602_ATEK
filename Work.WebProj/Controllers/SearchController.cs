using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;

namespace DotWeb.WebApp.Controllers
{
    public class SearchController : WebUserController
    {
        // GET: Search
        public ActionResult Index(string keyword)
        {
            if (keyword != null) {
                keyword = keyword.Replace("\r\n", "");
                keyword = keyword.Trim();
            }

            List<m_Product> items = new List<m_Product>();
            using (var db0 = getDB0())
            {
                if (keyword != "" & keyword != null)
                {
                    #region get content
                    items = db0.Product
                        .Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name &
                                    (x.Product_Category_L1.l1_name.Contains(keyword) ||
                                     x.Product_Category_L2.l2_name.Contains(keyword) ||
                                     x.Product_Category_L3.l3_name.Contains(keyword) ||
                                     x.power.Contains(keyword) ||
                                     x.technical_specification.Contains(keyword) ||
                                     x.feature.Contains(keyword))
                                    )
                                       .OrderByDescending(x => new { x.Product_Category_L1.l1_sort, x.Product_Category_L2.l2_sort, x.Product_Category_L3.l3_sort, x.sort })
                                             .Select(x => new m_Product()
                                             {
                                                 product_id = x.product_id,
                                                 l1_id = x.l1_id,
                                                 l2_id = x.l2_id,
                                                 l3_id = x.l3_id,
                                                 l1_name = x.Product_Category_L1.l1_name,
                                                 l2_name = x.Product_Category_L2.l2_name,
                                                 l3_name = x.Product_Category_L3.l3_name,
                                                 power = x.power,
                                                 models = x.ProductModel.OrderBy(w => w.sort).ToList()
                                             }).ToList();
                    #endregion
                    foreach (var i in items)
                    {
                        i.imgsrc = GetImg(i.product_id.ToString(), "img1", "Active", "ProductData", null);
                    }
                }
            }
            ViewBag.keyword = keyword;
            return View("Search", items);
        }
    }
}