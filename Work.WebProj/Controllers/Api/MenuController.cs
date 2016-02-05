using DotWeb.Helpers;
using ProcCore.Business;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class MenuController : ajaxApi<Menu, q_Menu>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.Menu.FindAsync(id);
                var get_menu_roles = item.AspNetRoles;
                var system_roles = await roleManager.Roles.Where(x => x.Name != "Admins").ToListAsync();
                item.role_array = new List<MenuRoleArray>();
                foreach (var role in system_roles)
                {
                    var role_object = get_menu_roles.Where(x => x.Id == role.Id).FirstOrDefault();
                    if (role_object != null)
                    {
                        item.role_array.Add(new MenuRoleArray() { role_id = role.Id, role_use = true, role_name = role.Name });
                    }
                    else
                    {
                        item.role_array.Add(new MenuRoleArray() { role_id = role.Id, role_use = false, role_name = role.Name });
                    }
                }
                r = new ResultInfo<Menu>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Menu q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.Menu
                    .OrderBy(x => x.menu_id)
                    .Select(x => new m_Menu()
                    {
                        menu_id = x.menu_id,
                        parent_menu_id = x.parent_menu_id,
                        menu_name = x.menu_name,
                        area = x.area,
                        controller = x.controller,
                        action = x.action,
                        icon_class = x.icon_class,
                        sort = x.sort,
                        is_folder = x.is_folder,
                        is_use = x.is_use
                    });
                if (q.keyword != null)
                {
                    items = items.Where(x => x.menu_name.Contains(q.keyword));
                }
                if (q.is_folder != null)
                {
                    items = items.Where(x => x.is_folder == q.is_folder);
                }

                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_Menu>()
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]Menu md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.Menu.FindAsync(md.menu_id);
                item.parent_menu_id = md.parent_menu_id;
                item.menu_name = md.menu_name;
                item.area = md.area;
                item.controller = md.controller;
                item.action = md.action;
                item.icon_class = md.icon_class;
                item.sort = md.sort;
                item.is_folder = md.is_folder;
                item.is_use = md.is_use;

                #region menu role
                var roles = item.AspNetRoles;
                foreach (var role in md.role_array)
                {
                    var get_now_role = roles.Where(x => x.Id == role.role_id).FirstOrDefault();
                    if (get_now_role != null && !role.role_use) //要刪除的權限
                    {
                        item.AspNetRoles.Remove(get_now_role);
                    }

                    if (get_now_role == null && role.role_use) //要新增的權限
                    {
                        var asp_role = db0.AspNetRoles.Where(x => x.Id == role.role_id).FirstOrDefault();
                        item.AspNetRoles.Add(asp_role);
                    }
                }
                #endregion

                await db0.SaveChangesAsync();
                rAjaxResult.result = true;
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.ToString();
            }
            finally
            {
                db0.Dispose();
            }
            return Ok(rAjaxResult);
        }
        public async Task<IHttpActionResult> Post([FromBody]Menu md)
        {
            md.menu_id = GetNewId(CodeTable.Menu);
            r = new ResultInfo<Menu>();
            if (!ModelState.IsValid)
            {
                r.message = ModelStateErrorPack();
                r.result = false;
                return Ok(r);
            }

            try
            {
                #region working
                db0 = getDB0();

                foreach (var role in md.role_array)
                {
                    if (role.role_use)
                    {
                        var asp_role = db0.AspNetRoles.Where(x => x.Id == role.role_id).FirstOrDefault();
                        md.AspNetRoles.Add(asp_role);
                    }
                }

                db0.Menu.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.menu_id;
                return Ok(r);
                #endregion
            }
            catch (DbEntityValidationException ex) //欄位驗證錯誤
            {
                r.message = getDbEntityValidationException(ex);
                r.result = false;
                return Ok(r);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message + "\r\n" + getErrorMessage(ex);
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> Delete([FromUri]int[] ids)
        {
            try
            {
                db0 = getDB0();
                r = new ResultInfo<Menu>();
                foreach (var id in ids)
                {
                    item = new Menu() { menu_id = id };
                    db0.Menu.Attach(item);
                    db0.Menu.Remove(item);
                }
                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
            }
            catch (DbUpdateException ex)
            {
                r.result = false;
                if (ex.InnerException != null)
                {
                    r.message = Resources.Res.Log_Err_Delete_DetailExist
                        + "\r\n" + getErrorMessage(ex);
                }
                else
                {
                    r.message = ex.Message;
                }
                return Ok(r);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
    }
    public class q_Menu : QueryBase
    {
        public string keyword { get; set; }
        public bool? is_folder { get; set; }
    }
}
