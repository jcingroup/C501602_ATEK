using DotWeb.Helpers;
using ProcCore.Business;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class SupportController : ajaxApi<Support, q_Support>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.Support.FindAsync(id);
                r = new ResultInfo<Support>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Support q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.Support
                    .OrderByDescending(x => x.sort)
                    .Select(x => new m_Support()
                    {
                        support_id = x.support_id,
                        support_title = x.support_title,
                        support_category = x.support_category,
                        l2_name = x.All_Category_L2.l2_name,
                        day = x.day,
                        sort = x.sort,
                        i_Hide = x.i_Hide,
                        i_Lang = x.i_Lang
                    });
                if (q.keyword != null)
                {
                    items = items.Where(x => x.support_title.Contains(q.keyword));
                }
                if (q.i_Lang != null)
                {
                    items = items.Where(x => x.i_Lang == q.i_Lang);
                }
                if (q.category != null)
                {
                    items = items.Where(x => x.support_category == q.category);
                }

                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_Support>()
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
        public async Task<IHttpActionResult> Put([FromBody]Support md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.Support.FindAsync(md.support_id);

                item.support_title = md.support_title;
                item.day = md.day;
                item.support_content = md.support_content;
                item.sort = md.sort;
                item.i_Hide = md.i_Hide;
                item.i_Lang = md.i_Lang;

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
        public async Task<IHttpActionResult> Post([FromBody]Support md)
        {
            md.support_id = GetNewId(CodeTable.Support);

            md.i_InsertDateTime = DateTime.Now;
            md.i_InsertDeptID = this.departmentId;
            md.i_InsertUserID = this.UserId;
            //md.i_Lang = "zh-TW";
            r = new ResultInfo<Support>();
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

                db0.Support.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.support_id;
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
                r = new ResultInfo<Support>();
                foreach (var id in ids)
                {
                    item = new Support() { support_id = id };
                    db0.Support.Attach(item);
                    db0.Support.Remove(item);
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
    public class q_Support : QueryBase
    {
        public string keyword { get; set; }
        public string i_Lang { get; set; }
        public int? category { get; set; }
    }
}
