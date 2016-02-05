using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;
using System.Collections.Generic;
using System.Linq;

namespace DotWeb.Controllers
{
    public class IndexController : WebUserController
    {
        public ActionResult Index()
        {
            IndexInfo info = new IndexInfo();
            using (var db0 = getDB0())
            {
                #region banner
                info.banners = db0.Banner.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderByDescending(x => x.sort)
                                         .Select(x => new m_Banner()
                                         {
                                             banner_id = x.banner_id,
                                             banner_name = x.banner_name
                                         }).ToList();
                foreach (var i in info.banners)
                {
                    i.imgsrc = GetImg(i.banner_id.ToString(), "Banner", "Active", "BannerData", null);
                }
                #endregion
                #region get other img
                info.NewProuctImgSrc = GetImg("IndexImg", "NewProduct", "Active", "ParmData", null);
                info.About1ImgSrc = GetImg("IndexImg", "About1", "Active", "ParmData", null);
                info.About2ImgSrc = GetImg("IndexImg", "About2", "Active", "ParmData", null);
                info.NewsImgSrc = GetImg("IndexImg", "EXHIBITION", "Active", "ParmData", null);
                info.SupportImgSrc = GetImg("IndexImg", "SUPPORT", "Active", "ParmData", null);
                #endregion
            }
            return View("Index", info);
        }

        public RedirectResult Login()
        {
            return Redirect("~/Base/Login");
        }
    }
    public class IndexInfo
    {
        public List<m_Banner> banners { get; set; }
        public string NewProuctImgSrc { get; set; }
        public string About1ImgSrc { get; set; }
        public string About2ImgSrc { get; set; }
        public string NewsImgSrc { get; set; }
        public string SupportImgSrc { get; set; }
    }
}
