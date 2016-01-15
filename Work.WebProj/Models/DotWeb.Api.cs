using DotWeb.CommSetup;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using ProcCore;
using ProcCore.Business;
using ProcCore.Business.DB0;
using ProcCore.Business.LogicConect;
using ProcCore.HandleResult;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Transactions;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace DotWeb.Api
{
    public class BaseApiController : ApiController
    {
        protected int defPageSize = 10;
        protected string aspUserId;
        protected int departmentId;
        protected string UserId;
        protected string LoginUserFlag = string.Empty;
        protected IEnumerable<string> UserRoles;
        protected C13B0_1KomoEntities db0;
        protected override void Initialize(System.Web.Http.Controllers.HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);

            var aspnet_user_id = User.Identity.GetUserId();
            #region 判斷是管理端、用戶端登入
            var getLoginUserFlag = controllerContext.Request.Headers.GetCookies("user_login").SingleOrDefault();
            LoginUserFlag = getLoginUserFlag == null ? "" :
                EncryptString.desDecryptBase64(getLoginUserFlag["user_login"].Value);
            #endregion
            if (aspnet_user_id != null)
            {
                ApplicationUser aspnet_user = UserManager.FindById(aspnet_user_id);
                UserId = aspnet_user.Id;
                departmentId = aspnet_user.department_id;
                UserRoles = aspnet_user.Roles.Select(x => x.RoleId);

                var getUserIdCookie = controllerContext.Request.Headers.GetCookies(CommWebSetup.WebCookiesId + ".member_id").SingleOrDefault();
                UserId = getUserIdCookie == null ? "" :
                    EncryptString.desDecryptBase64(getUserIdCookie[CommWebSetup.WebCookiesId + ".member_id"].Value);
            }
        }
        protected virtual string getRecMessage(string MsgId)
        {
            String r = Resources.Res.ResourceManager.GetString(MsgId);
            return String.IsNullOrEmpty(r) ? MsgId : r;
        }
        protected virtual LogicCenter openLogic()
        {
            LogicCenter dbLogic = new LogicCenter(CommSetup.CommWebSetup.DB0_CodeString);
            dbLogic.IP = System.Web.HttpContext.Current.Request.UserHostAddress;

            return dbLogic;
        }
        protected string getNowLnag()
        {
            return System.Globalization.CultureInfo.CurrentCulture.Name;
        }
        protected static C13B0_1KomoEntities getDB0()
        {
            LogicCenter.SetDB0EntityString(CommSetup.CommWebSetup.DB0_CodeString);
            return LogicCenter.getDB0;
        }
        protected string ModelStateErrorPack()
        {
            List<string> errMessage = new List<string>();
            foreach (var modelState in ModelState.Values)
                foreach (var error in modelState.Errors)
                    errMessage.Add(error.ErrorMessage);

            return string.Join(":", errMessage);
        }

        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }
        public RoleManager<IdentityRole> roleManager
        {
            get
            {
                ApplicationDbContext context = ApplicationDbContext.Create();
                return new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
            }
        }
        protected int GetNewId()
        {
            return GetNewId(ProcCore.Business.CodeTable.Base);
        }
        protected int GetNewId(CodeTable tab)
        {
            using (TransactionScope tx = new TransactionScope())
            {
                var db = getDB0();
                try
                {
                    string tab_name = Enum.GetName(typeof(CodeTable), tab);
                    var items = db.i_IDX.Where(x => x.table_name == tab_name).FirstOrDefault();

                    if (items == null)
                    {
                        return 0;
                    }
                    else
                    {
                        items.IDX++;
                        db.SaveChanges();
                        tx.Complete();
                        return items.IDX;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return 0;
                }
                finally
                {
                    db.Dispose();
                }
            }
        }
        protected TransactionScope defAsyncScope()
        {
            return new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        }
        protected string getErrorMessage(Exception ex)
        {
            string s = null;
            if (ex.InnerException != null)
            {
                s = getErrorMessage(ex.InnerException);
            }
            else
            {
                s = ex.Message;
            }
            return s;
        }
        protected string getDbEntityValidationException(DbEntityValidationException ex)
        {
            string m = null;
            foreach (var err_Items in ex.EntityValidationErrors)
            {
                foreach (var err_Item in err_Items.ValidationErrors)
                {
                    m += $"[{err_Item.PropertyName}][{err_Item.ErrorMessage}]";
                }
            }
            return m;
        }
        public static string RemoveScriptTag(string htmlSource)
        {
            //移除  javascript code.
            htmlSource = Regex.Replace(htmlSource, @"<script[\d\D]*?>[\d\D]*?</script>", String.Empty);

            //移除html tag.
            //htmlSource = Regex.Replace(htmlSource, @"<[^>]*>", String.Empty);
            return htmlSource;
        }
        #region 寄信相關
        public bool Mail_Send(string MailFrom, string[] MailTos, string MailSub, string MailBody, bool isBodyHtml)
        {
            try
            {
                //建立MailMessage物件
                MailMessage mms = new MailMessage();
                if (MailFrom != null)
                {
                    var mf = MailFrom.Split(':');
                    if (mf.Length == 2)
                    {
                        mms.From = new MailAddress(mf[1], mf[0]);//寄件人
                    }
                    else if (mf.Length == 1)
                    {
                        mms.From = new MailAddress(mf[0]);//寄件人
                    }
                }
                //mms.From = new MailAddress(MailFrom);//寄件人
                mms.Subject = MailSub;//信件主旨
                mms.Body = MailBody;//信件內容
                mms.IsBodyHtml = isBodyHtml;//判斷是否採用html格式

                if (MailTos != null)//防呆
                {
                    foreach (var str in MailTos)
                    {
                        if (str != "")
                        {
                            var m = str.Split(':');
                            if (m.Length == 2)
                            {
                                mms.To.Add(new MailAddress(m[1], m[0]));
                            }
                            else if (m.Length == 1)
                            {
                                mms.To.Add(new MailAddress(m[0]));
                            }
                        }
                    }
                }//End if (MailTos !=null)//防呆

                //if (Bcc != null) //防呆
                //{
                //    for (int i = 0; i < Bcc.Length; i++)
                //    {
                //        if (!string.IsNullOrEmpty(Bcc[i].Trim()))
                //        {
                //            //加入信件的密件副本(們)address
                //            mms.Bcc.Add(new MailAddress(Bcc[i].Trim()));
                //        }

                //    }
                //}//End if (Ccs!=null) //防呆



                using (SmtpClient client = new SmtpClient(CommWebSetup.MailServer))//或公司、客戶的smtp_server

                    client.Send(mms);//寄出一封信

                //釋放每個附件，才不會Lock住
                if (mms.Attachments != null && mms.Attachments.Count > 0)
                {
                    for (int i = 0; i < mms.Attachments.Count; i++)
                    {
                        mms.Attachments[i].Dispose();
                        mms.Attachments[i] = null;
                    }
                }

                return true;//寄信成功
            }
            catch (Exception)
            {
                return false;//寄信失敗
            }
        }

        #endregion
    }

    #region 泛型控制器擴充

    [System.Web.Http.Authorize]
    public abstract class ajaxApi<M, Q> : BaseApiController
        where M : new()
        where Q : QueryBase
    {
        protected ResultInfo<M> r;
        protected ResultInfo<M[]> rs;
        protected M item;
    }

    [System.Web.Http.Authorize]
    public abstract class ajaxBaseApi : BaseApiController
    {

    }
    #endregion
}