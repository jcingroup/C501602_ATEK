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
            return View("PSU_catalog");
        }
        public ActionResult PSU_content()
        {
            return View();
        }
        public ActionResult PSU_sidebar()
        {
            return View();
        }
        public ActionResult PSU_list()
        {
            return View();
        }
    }
}