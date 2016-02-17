using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;

namespace DotWeb.WebApp.Controllers
{
    public class ProductsController : WebUserController
    {
        // GET: Products
        public ActionResult Index()
        {
            List<m_Product_Category_L1> l1 = new List<m_Product_Category_L1>();
            using (var db0 = getDB0())
            {
                #region get category 
                l1 = db0.Product_Category_L1.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderByDescending(x => x.l1_sort)
                                         .Select(x => new m_Product_Category_L1()
                                         {
                                             product_category_l1_id = x.product_category_l1_id,
                                             l1_name = x.l1_name,
                                             l1_info = x.l1_info,
                                             l2_list = x.Product_Category_L2.Where(y => !y.i_Hide).OrderByDescending(y => y.l2_sort)
                                                                            .Select(y => new m_Product_Category_L2()
                                                                            {
                                                                                product_category_l2_id = y.product_category_l2_id,
                                                                                l2_name = y.l2_name,
                                                                                l3_list = y.Product_Category_L3.Where(z => !z.i_Hide).OrderByDescending(z => z.l3_sort)
                                                                                                             .Select(z => new m_Product_Category_L3()
                                                                                                             {
                                                                                                                 product_category_l3_id = z.product_category_l3_id,
                                                                                                                 l3_name = z.l3_name
                                                                                                             }).ToList()
                                                                            }).ToList()
                                         }).ToList();
                #endregion
            }
            return View("PSU_catalog", l1);
        }
        public ActionResult PSU_content(int? id)
        {
            ajax_GetProductSidebar();
            ProductContent content = new ProductContent();
            using (var db0 = getDB0())
            {
                #region get content
                bool Exist = db0.Product.Any(x => x.product_id == id & !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name);
                if (id == null || !Exist)
                {
                    return Redirect("~/Products");
                }
                else
                {
                    content.item = db0.Product.Find(id);
                    content.item.models = content.item.ProductModel.OrderBy(x => x.sort).ToList();
                    content.item.imgsrc = GetImg(id.ToString(), "img1", "Active", "ProductData", null);
                    #region get other product
                    content.product_list = db0.Product.Where(x => !x.i_Hide &
                                                                  x.l1_id == content.item.l1_id &
                                                                  x.l2_id == content.item.l2_id &
                                                                  x.l3_id == content.item.l3_id &
                                                                  x.product_id != id &
                                                                  x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name)
                                                     .OrderByDescending(x => x.sort)
                                                     .Select(x => new m_Product()
                                                     {
                                                         product_id = x.product_id,
                                                         power = x.power,
                                                         models = x.ProductModel.OrderBy(y => y.sort).ToList()
                                                     }).ToList();
                    #endregion
                }
                #endregion
            }
            return View(content);
        }
        public ActionResult PSU_sidebar()
        {
            return View();
        }
        public ActionResult PSU_list(int? l2_id)
        {
            ajax_GetProductSidebar();
            m_Product_Category_L2 l2 = new m_Product_Category_L2();
            using (var db0 = getDB0())
            {
                #region get content
                bool Exist = db0.Product_Category_L2.Any(x => x.product_category_l2_id == l2_id & !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name);
                if (l2_id == null || !Exist)
                {
                    return Redirect("~/Products");
                }
                else
                {
                    l2 = db0.Product_Category_L2.Where(x => x.product_category_l2_id == l2_id)
                                                .Select(x => new m_Product_Category_L2()
                                                {
                                                    product_category_l2_id = x.product_category_l2_id,
                                                    l2_name = x.l2_name,
                                                    l2_info = x.l2_info,
                                                    l3_list = x.Product_Category_L3.Where(y => !y.i_Hide).OrderByDescending(y => y.l3_sort)
                                                                                 .Select(y => new m_Product_Category_L3()
                                                                                 {
                                                                                     product_category_l3_id = y.product_category_l3_id,
                                                                                     l3_name = y.l3_name,
                                                                                     product_list = y.Product.Where(z => !z.i_Hide).OrderByDescending(z => z.sort)
                                                                                                           .Select(z => new m_Product()
                                                                                                           {
                                                                                                               product_id = z.product_id,
                                                                                                               power = z.power,
                                                                                                               models = z.ProductModel.OrderBy(w => w.sort).ToList()
                                                                                                           }).ToList()
                                                                                 }).ToList()
                                                }).FirstOrDefault();

                    foreach (var i in l2.l3_list)
                    {
                        foreach (var j in i.product_list)
                        {
                            j.imgsrc = GetImg(j.product_id.ToString(), "img1", "Active", "ProductData", null);
                        }
                    }
                }
                #endregion
            }
            ViewBag.l2_id = l2_id;
            return View(l2);
        }
        /// <summary>
        /// 取得產品左選單內容
        /// </summary>
        public void ajax_GetProductSidebar()
        {
            List<L1> l1 = new List<L1>();
            using (var db0 = getDB0())
            {
                #region get category 
                l1 = db0.Product_Category_L1.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderByDescending(x => x.l1_sort)
                                         .Select(x => new L1()
                                         {
                                             l1_id = x.product_category_l1_id,
                                             l1_name = x.l1_name,
                                             l2_list = x.Product_Category_L2.Where(y => !y.i_Hide).OrderByDescending(y => y.l2_sort)
                                                                            .Select(y => new L2()
                                                                            {
                                                                                l2_id = y.product_category_l2_id,
                                                                                l2_name = y.l2_name,
                                                                                l3_list = y.Product_Category_L3.Where(z => !z.i_Hide).OrderByDescending(z => z.l3_sort)
                                                                                                             .Select(z => new L3()
                                                                                                             {
                                                                                                                 l3_id = z.product_category_l3_id,
                                                                                                                 l3_name = z.l3_name
                                                                                                             }).ToList()
                                                                            }).ToList()
                                         }).ToList();
                #endregion
            }
            ViewBag.Sidebar = l1;
        }
    }
    public class ProductContent
    {
        public Product item { get; set; }
        public List<m_Product> product_list { get; set; }
    }
}