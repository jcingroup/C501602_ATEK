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
    public class ProductDataController : AdminController
    {
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        public ActionResult CategoryL1()
        {
            ActionRun();
            return View();
        }
        public ActionResult CategoryL2()
        {
            ActionRun();
            return View();
        }
        public ActionResult CategoryL3()
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
                //代表圖
                if (filekind == "img1")
                    handleImageSave(fileName, id, ImageFileUpParm.Product, filekind, "Active", "ProductData");
                //證書
                if (filekind == "CE")
                    handleImageSave(fileName, id, ImageFileUpParm.Certificate, filekind, "Active", "ProductData");
                if (filekind == "UL")
                    handleImageSave(fileName, id, ImageFileUpParm.Certificate, filekind, "Active", "ProductData");
                if (filekind == "PSE")
                    handleImageSave(fileName, id, ImageFileUpParm.Certificate, filekind, "Active", "ProductData");
                if (filekind == "VDE")
                    handleImageSave(fileName, id, ImageFileUpParm.Certificate, filekind, "Active", "ProductData");
                //附件
                if (filekind == "file1")
                    handleFileSave(fileName, id, SysFileUpParm.BaseLimit, filekind, "Active", "ProductData");

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
            if (filekind == "file1")
            {
                r.files = listDocFiles(id, filekind, "Active", "ProductData");
            }
            else {
                r.files = listImgFiles(id, filekind, "Active", "ProductData");
            }
            r.result = true;
            return defJSON(r);
        }

        [HttpPost]
        public string aj_FDelete(string id, string filekind, string filename)
        {
            ResultInfo r = new ResultInfo();
            DeleteSysFile(id, filekind, filename, ImageFileUpParm.NewsBasicSingle, "Active", "ProductData");
            r.result = true;
            return defJSON(r);
        }
        [HttpGet]
        public FileResult aj_FDown(int id, string filekind, string filename)
        {
            string path_tpl = string.Format("~/_Code/SysUpFiles/{0}/{1}/{2}/{3}/{4}", "Active", "ProductData", id, filekind, filename);
            string server_path = Server.MapPath(path_tpl);
            FileInfo file_info = new FileInfo(server_path);
            FileStream file_stream = new FileStream(server_path, FileMode.Open, FileAccess.Read);
            string web_path = Url.Content(path_tpl);
            return File(file_stream, "application/*", file_info.Name);
        }
        #endregion
    }
}