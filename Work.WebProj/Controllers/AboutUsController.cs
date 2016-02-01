using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.Business.DB0;

namespace DotWeb.WebApp.Controllers
{
    public class AboutUsController : WebUserController
    {
        // GET: AboutUs
        public ActionResult Index()
        {
            List<m_AboutUsDetail> detail = new List<m_AboutUsDetail>();
            using (var db0 = getDB0())
            {
                #region banner
                detail = db0.AboutUsDetail.Where(x => !x.i_Hide & x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name).OrderBy(x => x.sort)
                                         .Select(x => new m_AboutUsDetail()
                                         {
                                             aboutus_detail_id = x.aboutus_detail_id,
                                             detail_content = x.detail_content
                                         }).ToList();
                #endregion
            }
            return View("AboutUs", detail);
        }
    }
}