using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DotWeb.Controller;

namespace DotWeb.WebApp.Controllers
{
    public class ProductsController : WebUserController
    {
        // GET: Products
        public ActionResult Index()
        {
            return View("PSU_list");
        }

        public ActionResult PSU_content()
        {
            return View();
        }
}
}