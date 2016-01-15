using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.Business.LogicConect;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;
using System.Linq;

namespace DotWeb.Areas.Active.Controllers
{
    public class BannerDataController : AdminController
    {
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        #endregion

        #region ajax call section
        public string aj_Init()
        {
            using (var db0 = getDB0())
            {
                return defJSON(new
                {
                });
            }
        }
        #endregion


        #region ajax file section
        [HttpPost]
        public string aj_FUpload(string id, string filekind, string fileName)
        {
            UpFileInfo r = new UpFileInfo();
            #region
            string tpl_File = string.Empty;
            try
            {
                //banner
                if (filekind == "Banner")
                    handleImageSave(fileName, id, ImageFileUpParm.BannerRotator, filekind, "Active", "BannerData");

                //廠商
                if (filekind == "Firm")
                    handleImageSave(fileName, id, ImageFileUpParm.FirmRotator, filekind, "Active", "BannerData");


                r.result = true;
                r.file_name = fileName;
            }
            catch (LogicError ex)
            {
                r.result = false;
                r.message = getRecMessage(ex.Message);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
            }
            #endregion
            return defJSON(r);
        }

        [HttpPost]
        public string aj_FList(string id, string filekind)
        {
            SerializeFileList r = new SerializeFileList();

            r.files = listImgFiles(id, filekind, "Active", "BannerData");
            r.result = true;
            return defJSON(r);
        }

        [HttpPost]
        public string aj_FDelete(string id, string filekind, string filename)
        {
            ResultInfo r = new ResultInfo();
            DeleteSysFile(id, filekind, filename, ImageFileUpParm.NewsBasicSingle, "Active", "BannerData");
            r.result = true;
            return defJSON(r);
        }
        #endregion
    }
}