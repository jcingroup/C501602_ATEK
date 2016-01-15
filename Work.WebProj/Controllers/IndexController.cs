using System.Web.Mvc;
using DotWeb.Controller;

namespace DotWeb.Controllers
{
    public class IndexController : WebUserController
    {
        public ActionResult Index()
        {
            return View("Index");
        }

        public RedirectResult Login()
        {
            return Redirect("~/Base/Login");
        }

    }
}
