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
    public class AllCategoryL1Controller : ajaxApi<All_Category_L1, q_All_Category_L1>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.All_Category_L1.FindAsync(id);
                r = new ResultInfo<All_Category_L1>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_All_Category_L1 q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.All_Category_L1
                    .OrderBy(x => x.all_category_l1_id)
                    .Where(x => !x.i_Hide)
                    .Select(x => new m_All_Category_L1()
                    {
                        all_category_l1_id = x.all_category_l1_id,
                        l1_name = x.l1_name,
                        memo = x.memo,
                        sort = x.sort,
                        i_Hide = x.i_Hide,
                        i_Lang = x.i_Lang
                    });
                if (q.main_id != null)
                {
                    items = items.Where(x => x.all_category_l1_id == q.main_id);
                }

                if (q.i_Lang != null)
                {
                    items = items.Where(x => x.i_Lang == q.i_Lang);
                }

                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_All_Category_L1>()
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
        public async Task<IHttpActionResult> Put([FromBody]All_Category_L1 md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.All_Category_L1.FindAsync(md.all_category_l1_id);

                item.l1_name = md.l1_name;
                item.memo = md.memo;
                item.sort = md.sort;
                item.i_Hide = md.i_Hide;
                //item.i_Lang = md.i_Lang;

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
        public async Task<IHttpActionResult> Post([FromBody]All_Category_L1 md)
        {
            md.all_category_l1_id = GetNewId(CodeTable.All_Category_L1);

            md.i_InsertDateTime = DateTime.Now;
            md.i_InsertDeptID = this.departmentId;
            md.i_InsertUserID = this.UserId;
            //md.i_Lang = "zh-TW";
            r = new ResultInfo<All_Category_L1>();
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

                db0.All_Category_L1.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.all_category_l1_id;
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
                r = new ResultInfo<All_Category_L1>();
                foreach (var id in ids)
                {
                    item = new All_Category_L1() { all_category_l1_id = id };
                    db0.All_Category_L1.Attach(item);
                    db0.All_Category_L1.Remove(item);
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
    public class q_All_Category_L1 : QueryBase
    {
        public string keyword { get; set; }
        public string i_Lang { get; set; }
        public int? main_id { get; set; }
    }
}
