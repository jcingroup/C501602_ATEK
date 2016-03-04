using DotWeb.CommSetup;
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
        public string aj_Init(int? type)
        {
            Param item = new Param();
            var open = openLogic();
            using (var db0 = getDB0())
            {
                type = type == null ? (int)IndexImgType.US : type;
                if (type == (int)IndexImgType.US)
                {
                    item.url_1 = (string)open.getParmValue(ParmDefine.url_1);
                    item.url_2 = (string)open.getParmValue(ParmDefine.url_2);
                    item.url_3 = (string)open.getParmValue(ParmDefine.url_3);
                    item.url_4 = (string)open.getParmValue(ParmDefine.url_4);
                    item.url_5 = (string)open.getParmValue(ParmDefine.url_5);
                }
                else if (type == (int)IndexImgType.JP)
                {
                    item.url_1 = (string)open.getParmValue(ParmDefine.url_1_jp);
                    item.url_2 = (string)open.getParmValue(ParmDefine.url_2_jp);
                    item.url_3 = (string)open.getParmValue(ParmDefine.url_3_jp);
                    item.url_4 = (string)open.getParmValue(ParmDefine.url_4_jp);
                    item.url_5 = (string)open.getParmValue(ParmDefine.url_5_jp);
                }
                return defJSON(item);
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
                if (filekind == "NewProduct")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexNewProduct, filekind, "Active", "ParmData");
                if (filekind == "About1")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "About2")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "EXHIBITION")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "SUPPORT")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");

                if (filekind == "NewProduct_jp")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexNewProduct, filekind, "Active", "ParmData");
                if (filekind == "About1_jp")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "About2_jp")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "EXHIBITION_jp")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");
                if (filekind == "SUPPORT_jp")
                    handleImageSave(fileName, id, ImageFileUpParm.IndexInfo, filekind, "Active", "ParmData");


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

            r.files = listImgFiles(id, filekind, "Active", "ParmData");
            r.result = true;
            return defJSON(r);
        }

        [HttpPost]
        public string aj_FDelete(string id, string filekind, string filename)
        {
            ResultInfo r = new ResultInfo();
            DeleteSysFile(id, filekind, filename, ImageFileUpParm.NewsBasicSingle, "Active", "ParmData");
            r.result = true;
            return defJSON(r);
        }
        #endregion
    }

}