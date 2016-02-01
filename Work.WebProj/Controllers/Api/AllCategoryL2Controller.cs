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
    public class AllCategoryL2Controller : ajaxApi<All_Category_L2, q_All_Category_L2>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.All_Category_L2.FindAsync(id);
                r = new ResultInfo<All_Category_L2>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_All_Category_L2 q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.All_Category_L2
                    .OrderBy(x => x.sort)
                    .Where(x => x.all_category_l1_id == q.main_id && x.i_Lang == System.Globalization.CultureInfo.CurrentCulture.Name)
                    .Select(x => new m_All_Category_L2()
                    {
                        all_category_l1_id = x.all_category_l1_id,
                        all_category_l2_id = x.all_category_l2_id,
                        l2_name = x.l2_name,
                        memo = x.memo,
                        sort = x.sort,
                        i_Hide = x.i_Hide,
                        i_Lang = x.i_Lang
                    });


                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_All_Category_L2>()
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
        public async Task<IHttpActionResult> Put([FromBody]All_Category_L2 md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.All_Category_L2.FindAsync(md.all_category_l2_id);

                item.l2_name = md.l2_name;
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
        public async Task<IHttpActionResult> Post([FromBody]All_Category_L2 md)
        {
            md.all_category_l2_id = GetNewId(CodeTable.All_Category_L2);

            md.i_InsertDateTime = DateTime.Now;
            md.i_InsertDeptID = this.departmentId;
            md.i_InsertUserID = this.UserId;
            //md.i_Lang = "zh-TW";
            r = new ResultInfo<All_Category_L2>();
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

                db0.All_Category_L2.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.all_category_l2_id;
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
                r = new ResultInfo<All_Category_L2>();
                foreach (var id in ids)
                {
                    item = new All_Category_L2() { all_category_l2_id = id };
                    db0.All_Category_L2.Attach(item);
                    db0.All_Category_L2.Remove(item);
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
    public class q_All_Category_L2 : QueryBase
    {
        public string keyword { get; set; }
        public string i_Lang { get; set; }
        public int? main_id { get; set; }
    }
}
