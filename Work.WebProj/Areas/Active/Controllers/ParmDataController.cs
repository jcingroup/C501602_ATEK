using DotWeb.Controller;
using ProcCore.Business.DB0;
using ProcCore.Business.LogicConect;
using ProcCore.HandleResult;
using System;
using System.Collections.Specialized;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class ParmDataController : AdminController
    {
        #region Action and function section
        public ActionResult IndexImg()
        {
            ActionRun();
            return View();
        }
        public ActionResult Parm()
        {
            ActionRun();
            return View();
        }
        #endregion

        #region ajax call section
        public string aj_Init()
        {
            var open = openLogic();
            using (var db0 = getDB0())
            {
                //string AboutUs = (string)open.getParmValue(ParmDefine.AboutUs);
                return defJSON(new { });
            }
        }
        public string aj_ParamInit()
        {
            Param item = new Param();
            var open = openLogic();
            using (var db0 = getDB0())
            {
                item.Email = (string)open.getParmValue(ParmDefine.Email);

                return defJSON(item);
            }
        }
        #endregion
    }

}