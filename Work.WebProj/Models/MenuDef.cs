using System.Collections.Generic;

namespace DotWeb.WebApp.Models
{
    public class MenuDef
    {
        public string Action { get; set; }
        public string Area { get; set; }
        public IDictionary<string, object> Attributes { get; set; }
        public bool? Clickable { get; set; }
        public string Controller { get; set; }
        public string Description { get; set; }
        public string HostName { get; set; }
        public string ImageUrl { get; set; }
        public int Key { get; set; }
        public int ParentKey { get; set; }
        public int sort { get; set; }
        public string TargetFrame { get; set; }
        public string Title { get; set; }
        public IList<MenuDef> sub { get; set; }
        public bool Checked {get;set;}
        public string IconClass { get; set; }
    }
}
