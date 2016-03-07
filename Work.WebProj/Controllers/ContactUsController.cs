using System;
using System.Web.Mvc;
using DotWeb.Controller;
using ProcCore.HandleResult;
using GooglereCAPTCHa.Models;
using DotWeb.CommSetup;

namespace DotWeb.WebApp.Controllers
{
    public class ContactUsController : WebUserController
    {
        // GET: ContactUs
        public ActionResult Index()
        {
            return View("ContactUs");
        }

        [HttpPost]
        public string sendMail(ContactUsMailContent md)
        {
            ResultInfo r = new ResultInfo();
            #region 驗證碼
            ValidateResponse Validate = ValidateCaptcha(md.response, "6LexIhoTAAAAAL-SrVm8_fYcL7pTnovF4T7GozRx");
            if (!Validate.Success)
            {
                r.result = false;
                r.message = Resources.Res.Log_Err_googleValideNotEquel;
                return defJSON(r);
            }
            #endregion
            try
            {
                using (db0 = getDB0())
                {
                    if (md.email == null)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_MailAddressBlank;
                        return defJSON(r);
                    }
                    #region 信件發送
                    string Body = getMailBody("ContactUsEmail", md);//套用信件版面
                    Boolean mail;
                    string mailfrom = md.name + ":" + md.email;

                    mail = Mail_Send(mailfrom, //寄信人
                                    openLogic().getReceiveMails(), //收信人
                                    CommWebSetup.MailTitle, //信件標題
                                    Body, //信件內容
                                    true); //是否為html格式
                    if (mail == false)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_SendMailFail;
                        return defJSON(r);
                    }
                    #endregion
                }
                r.result = true;
                r.message = Resources.Res.Log_Success_SendMail;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
            }
            return defJSON(r);
        }
    }
    public class ContactUsMailContent
    {
        public string title { get; set; }
        public string name { get; set; }
        public string company { get; set; }
        public string tel { get; set; }
        public string fax { get; set; }
        public string email { get; set; }
        public string content { get; set; }
        public string response { get; set; }
    }

}