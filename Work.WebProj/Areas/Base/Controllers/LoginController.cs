using DotWeb.CommSetup;
using DotWeb.Controller;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.NetExtension;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
namespace DotWeb.Areas.Base.Controllers
{
    public class LoginController : WebUserController
    {
        private ApplicationUserManager _userManager;
        private ApplicationSignInManager _signInManager;

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }
        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ActionResult Main()
        {
            HttpContext.GetOwinContext().Authentication.SignOut();
            ViewData["username"] = "";
            ViewData["password"] = "";
            ViewData["validate"] = "";

#if DEBUG
            ViewData["username"] = CommWebSetup.AutoLoginUser;
            ViewData["password"] = CommWebSetup.AutoLoginPassword;
            ViewData["validate"] = "1";
#endif
            removeCookie("user_id");
            removeCookie("user_name");
            removeCookie(CommWebSetup.WebCookiesId + ".member_id");
            removeCookie(CommWebSetup.WebCookiesId + ".member_name");
            removeCookie("user_login");

            ViewBag.BodyClass = "Login";
            ViewBag.Year = DateTime.Now.Year;

            return View("index");
        }
        [AllowAnonymous]
        public ActionResult ResetPassword(string code)
        {
            if (code == null)
            {
                return View("Error");
            }

            ResetPasswordViewModel md = new ResetPasswordViewModel()
            {
                Code = code
            };

            return View(md);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<string> ajax_Login(LoginViewModel model)
        {
            var userManager = UserManager;

            LoginResult getLoginResult = new LoginResult();

            //if (!ModelState.IsValid)
            //{
            //    getLoginResult.result = false;
            //    getLoginResult.message = "資訊不完整";
            //    return defJSON(getLoginResult);
            //}

            #region 驗證碼檢查程序

#if DEBUG
            getLoginResult.vildate = true;
#else
            if (string.IsNullOrEmpty(Session["CheckCode"].ToString()))
            {
                Session["CheckCode"] = Guid.NewGuid();
                getLoginResult.result = false;
                getLoginResult.message = Resources.Res.Log_Err_ImgValideNotEquel;
                return defJSON(getLoginResult);
            }

            getLoginResult.vildate = Session["CheckCode"].Equals(model.validate) ? true : false;
#endif
            if (!getLoginResult.vildate)
            {
                Session["CheckCode"] = Guid.NewGuid(); //只要有錯先隨意產生唯一碼 以防暴力破解，新的CheckCode會在Validate產生。
                getLoginResult.result = false;
                getLoginResult.message = Resources.Res.Log_Err_ImgValideNotEquel;
                return defJSON(getLoginResult);
            }
            #endregion

            #region 帳密碼檢查

            var result = await SignInManager.PasswordSignInAsync(model.account, model.password, model.rememberme, shouldLockout: false);

            if (result == SignInStatus.Failure)
            {
                getLoginResult.result = false;
                getLoginResult.message = Resources.Res.Login_Err_Password;
                return defJSON(getLoginResult);
            }

            getLoginResult.result = true;
            var item = await userManager.FindByNameAsync(model.account);

            if (isTablet)
            {
                getLoginResult.url = Url.Content(CommWebSetup.ManageDefCTR);  //是行動裝置
            }
            else
            {
                //不是行動裝置
                var get_user_roles_id = item.Roles.Select(x => x.RoleId);

                ApplicationDbContext context = ApplicationDbContext.Create();
                var roleManage = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
                var get_user_roles_name = roleManage.Roles.Where(x => get_user_roles_id.Contains(x.Id)).Select(x => x.Name);

                if (get_user_roles_name.Contains("Admins") || get_user_roles_name.Contains("Managers"))
                {
                    getLoginResult.url = Url.Content(CommWebSetup.ManageDefCTR);
                }
                else
                {
                    getLoginResult.url = Url.Content("~/Active/Sales/PersonalInfo");
                }
            }

            Response.Cookies.Add(new HttpCookie(CommWebSetup.Cookie_UserName, item.UserName));
            Response.Cookies.Add(new HttpCookie(CommWebSetup.Cookie_LastLogin, DateTime.Now.ToString("yyyy-MM-dd")));
            #endregion

            //語系使用
            HttpCookie WebLang = Request.Cookies[CommWebSetup.WebCookiesId + ".Lang"];
            WebLang.Value = model.lang;
            Response.Cookies.Add(WebLang);

            try
            {
                var db = getDB0();

                var item_department = await db.Department.FindAsync(item.department_id);

                Response.Cookies.Add(new HttpCookie(CommWebSetup.Cookie_DepartmentId, item.department_id.ToString()));
                //Response.Cookies.Add(new HttpCookie(CommWebSetup.Cookie_DepartmentName, item_department.department_name));
                Response.Cookies.Add(new HttpCookie("user_login", Server.UrlEncode(EncryptString.desEncryptBase64("N"))));
                var item_lang = db.i_Lang
                    .Where(x => x.lang == WebLang.Value)
                    .Select(x => new { x.area })
                    .Single();

                ViewData["lang"] = item_lang.area;
                db.Dispose();
            }
            catch (Exception ex)
            {
                getLoginResult.result = false;
                getLoginResult.message = ex.Message;
                return defJSON(getLoginResult);
            }

            return defJSON(getLoginResult);
        }
        private async Task SignInAsync(ApplicationUser user, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            AuthenticationManager.SignIn(
                new AuthenticationProperties() { IsPersistent = isPersistent },
                await user.GenerateUserIdentityAsync(UserManager));
        }
        [HttpPost]
        public string ajax_Lang()
        {
            using (var db = getDB0())
            {
                var langs = db.i_Lang.Where(x => x.isuse == true).OrderBy(x => x.sort);
                return defJSON(langs);
            }
        }
        public RedirectResult Logout()
        {
            HttpContext.GetOwinContext().Authentication.SignOut();

            string getLoginFlag = string.Empty;
            var getCookie = Request.Cookies["user_login"];
            getLoginFlag = getCookie == null ? "Y" :
                EncryptString.desDecryptBase64(Server.UrlDecode(getCookie.Value)); //Value:N

            removeCookie("user_id");
            removeCookie("user_name");
            removeCookie(CommWebSetup.WebCookiesId + ".member_id");
            removeCookie(CommWebSetup.WebCookiesId + ".member_name");
            removeCookie("user_login");

            ObjectCache cache = MemoryCache.Default;
            cache.Clear();

            //SiteMaps.ReleaseSiteMap();

            if (getLoginFlag == "Y")
                return Redirect("~");
            else
                return Redirect("~/_SysAdm?t=" + DateTime.Now.Ticks);

        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<string> ajax_ForgotPassword(ForgotPasswordViewModel model)
        {
            ResultInfo rAjaxResult = new ResultInfo();

            try
            {
                if (ModelState.IsValid)
                {
                    var user = await UserManager.FindByEmailAsync(model.Email);
                    //2014-5-20 Jerry 目前本系統不作Email驗證工作
                    //if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
                    if (user == null)
                        throw new Exception(Resources.Res.Login_Err_Password);

                    string code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                    var callbackUrl = Url.Action("ResetPassword", "MNGLogin", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    await UserManager.SendEmailAsync(user.Id, "重設密碼", "請按 <a href=\"" + callbackUrl + "\">這裏</a> 重設密碼");

                    rAjaxResult.result = true;
                }
                else
                {
                    List<string> errMessage = new List<string>();
                    foreach (ModelState modelState in ModelState.Values)
                        foreach (ModelError error in modelState.Errors)
                            errMessage.Add(error.ErrorMessage);

                    rAjaxResult.message = String.Join(":", errMessage);
                    rAjaxResult.result = false;
                }
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
            }

            return defJSON(rAjaxResult);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<string> ajax_ResetPassword(ResetPasswordViewModel model)
        {
            ResultInfo rAjaxResult = new ResultInfo();

            try
            {
                if (ModelState.IsValid)
                {
                    var user = await UserManager.FindByEmailAsync(model.Email);
                    if (user == null)
                    {
                        rAjaxResult.result = false;
                        rAjaxResult.message = Resources.Res.Log_Err_NoThisUser;
                        return defJSON(rAjaxResult);
                    }
                    IdentityResult result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
                    if (result.Succeeded)
                    {
                        rAjaxResult.result = true;
                        return defJSON(rAjaxResult);
                    }
                    else
                    {
                        rAjaxResult.message = String.Join(":", result.Errors);
                        rAjaxResult.result = false;
                        return defJSON(rAjaxResult);
                    }
                }
                else
                {
                    List<string> errMessage = new List<string>();
                    foreach (ModelState modelState in ModelState.Values)
                        foreach (ModelError error in modelState.Errors)
                            errMessage.Add(error.ErrorMessage);

                    rAjaxResult.message = String.Join(":", errMessage);
                    rAjaxResult.result = false;
                    return defJSON(rAjaxResult);
                }
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
                return defJSON(rAjaxResult);
            }
        }
        private void removeCookie(string key)
        {
            var c = new HttpCookie(key);
            c.Values.Clear();
            c.Expires = DateTime.Now.AddDays(-1);
            Response.Cookies.Set(c);
        }

        #region 前台會員登入

        //[HttpPost]
        //[AllowAnonymous]
        //public async Task<string> ajax_MemberLogin(MemberLogin obj)
        //{
        //    LoginResult rAjaxResult = new LoginResult();
        //    if (!ModelState.IsValid)
        //    {
        //        rAjaxResult.result = false;
        //        rAjaxResult.message = "資訊不完整";
        //        return defJSON(rAjaxResult);
        //    }

        //    #region 驗證碼檢查程序
        //    if (string.IsNullOrEmpty(Session["MemberLogin"].ToString()))
        //    {
        //        Session["MemberLogin"] = Guid.NewGuid();
        //        rAjaxResult.result = false;
        //        rAjaxResult.message = Resources.Res.Log_Err_ImgValideNotEquel;
        //        return defJSON(rAjaxResult);
        //    }

        //    rAjaxResult.vildate = Session["MemberLogin"].Equals(obj.validate) ? true : false;
        //    //#if DEBUG
        //    //            rAjaxResult.vildate = true;
        //    //#endif
        //    if (!rAjaxResult.vildate)
        //    {
        //        Session["MemberLogin"] = Guid.NewGuid(); //只要有錯先隨意產生唯一碼 以防暴力破解，新的CheckCode會在Validate產生。
        //        rAjaxResult.result = false;
        //        rAjaxResult.message = Resources.Res.Log_Err_ImgValideNotEquel;
        //        return defJSON(rAjaxResult);
        //    }
        //    #endregion
        //    var db0 = getDB0();
        //    obj.pwd = HttpUtility.UrlEncode(EncryptString.desEncryptBase64(obj.pwd));
        //    var get_user = db0.Sales.Where(x => x.account == obj.act & x.password == obj.pwd).FirstOrDefault();

        //    if (get_user != null)
        //    {
        //        #region 前台_會員登入用cookie
        //        Response.Cookies.Add(new HttpCookie(CommWebSetup.WebCookiesId + ".member_id", Server.UrlEncode(EncryptString.desEncryptBase64(get_user.sales_no))));
        //        Response.Cookies.Add(new HttpCookie(CommWebSetup.WebCookiesId + ".member_name", Server.UrlEncode(get_user.sales_name)));
        //        //設定過期時間1天
        //        //Response.Cookies[CommWebSetup.WebCookiesId + ".member_id"].Expires = DateTime.Now.AddDays(1);
        //        //Response.Cookies[CommWebSetup.WebCookiesId + ".member_name"].Expires = DateTime.Now.AddDays(1);
        //        #endregion
        //        #region 後台_會員登入用cookie
        //        Session["CheckCode"] = "jcin";


        //        #region 不同等級(rank)用不同帳號登入
        //        string login_model = string.Empty;
        //        if (get_user.rank == (int)SalesRankState.managementOffice)
        //        {//管理處
        //            login_model = await ajax_Login(new LoginViewModel()
        //            {
        //                account = "ManagementOffice",
        //                password = "4257386-",
        //                lang = "zh-TW",
        //                rememberme = false,
        //                validate = "jcin"
        //            });
        //        }
        //        else if (get_user.rank == (int)SalesRankState.operationsCenter)
        //        {//營運中心
        //            login_model = await ajax_Login(new LoginViewModel()
        //            {
        //                account = "OperationsCenter",
        //                password = "4257386-",
        //                lang = "zh-TW",
        //                rememberme = false,
        //                validate = "jcin"
        //            });
        //        }
        //        else if (get_user.rank == (int)SalesRankState.manager)
        //        {//經理人
        //            login_model = await ajax_Login(new LoginViewModel()
        //            {
        //                account = "SalesManager",
        //                password = "4257386-",
        //                lang = "zh-TW",
        //                rememberme = false,
        //                validate = "jcin"
        //            });
        //        }
        //        else
        //        {//共享會員(一般會員)
        //            login_model = await ajax_Login(new LoginViewModel()
        //            {
        //                account = "user",
        //                password = "4257386-",
        //                lang = "zh-TW",
        //                rememberme = false,
        //                validate = "jcin"
        //            });
        //        }
        //        #endregion
        //        LoginResult trnResult = Newtonsoft.Json.JsonConvert.DeserializeObject<LoginResult>(login_model);
        //        if (trnResult.result)
        //        {
        //            Response.Cookies.Add(new HttpCookie("user_login", Server.UrlEncode(EncryptString.desEncryptBase64("Y"))));
        //        }

        //        #endregion

        //        rAjaxResult.result = true;
        //        rAjaxResult.url = Url.Content("~");
        //        return defJSON(rAjaxResult);
        //    }
        //    else
        //    {
        //        rAjaxResult.result = false;
        //        rAjaxResult.message = "帳號或密碼錯誤 請重新輸入";
        //        return defJSON(rAjaxResult);
        //    }
        //}
        //[AllowAnonymous]
        //public RedirectResult ajax_MemberLogout()
        //{
        //    removeCookie(CommWebSetup.WebCookiesId + ".member_id");
        //    removeCookie(CommWebSetup.WebCookiesId + ".member_name");
        //    removeCookie("user_login");

        //    return Redirect("~");
        //}

        #endregion



        public class MemberLogin
        {
            public string act { get; set; }
            public string pwd { get; set; }
            public string validate { get; set; }
        }
        class LoginResult
        {
            public String title { get; set; }
            public Boolean vildate { get; set; }
            public Boolean result { get; set; }
            public String message { get; set; }
            public String url { get; set; }
        }
        public class LoginViewModel
        {
            [Required]
            public string account { get; set; }
            [Required]
            [DataType(DataType.Password)]
            public string password { get; set; }
            [Required]
            public string lang { get; set; }
            [Required]
            public string validate { get; set; }
            public bool rememberme { get; set; }
        }
    }
}
