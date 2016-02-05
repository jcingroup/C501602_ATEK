using DotWeb.Controller;
using ProcCore.Business.DB0;
using System.Linq;
using System.Web.Mvc;

namespace DotWeb.Areas.Base.Controllers
{
    public class MenuController : AdminController
    {
        #region Working
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        #endregion


        public string aj_Init()
        {
            using (var db0 = getDB0())
            {
                return defJSON(new
                {
                    options_folder = db0.Menu.Where(x => x.is_folder).OrderBy(x => x.menu_id).Select(x => new option() { val = x.menu_id, Lname = x.menu_name })
                });
            }
        }
    }
}