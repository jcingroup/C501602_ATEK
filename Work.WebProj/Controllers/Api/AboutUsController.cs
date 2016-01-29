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
    public class AboutUsController : ajaxApi<AboutUs, q_AboutUs>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.AboutUs.FindAsync(id);
                r = new ResultInfo<AboutUs>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_AboutUs q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.AboutUs
                    .OrderBy(x => x.sort)
                    .Select(x => new m_AboutUs()
                    {
                        aboutus_id = x.aboutus_id,
                        sort = x.sort,
                        i_Hide = x.i_Hide
                    });

                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_AboutUs>()
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
        public async Task<IHttpActionResult> Put([FromBody]AboutUs md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.AboutUs.FindAsync(md.aboutus_id);
                //string lang = string.Empty;
                //if (md.AboutUsDetail.Count() > 0)
                //    lang = md.AboutUsDetail.FirstOrDefault().i_Lang;

                var details = item.AboutUsDetail;

                foreach (var detail in details)
                {
                    var md_detail = md.AboutUsDetail.First(x => x.aboutus_detail_id == detail.aboutus_detail_id);
                    detail.sort = md_detail.sort;
                    detail.detail_content = md_detail.detail_content;
                    detail.i_Hide = md_detail.i_Hide;
                }

                var add_detail = md.AboutUsDetail.Where(x => x.edit_state == EditState.Insert);
                foreach (var detail in add_detail)
                {
                    detail.aboutus_detail_id = GetNewId(CodeTable.AboutUsDetail);
                    detail.i_InsertUserID = this.UserId;
                    detail.i_InsertDateTime = DateTime.Now;
                    detail.i_InsertDeptID = this.departmentId;
                    //detail.i_Lang = System.Globalization.CultureInfo.CurrentCulture.Name;
                    //detail.i_Lang = "zh-TW";
                    details.Add(detail);
                }

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
        public async Task<IHttpActionResult> Post([FromBody]AboutUs md)
        {
            md.aboutus_id = GetNewId(CodeTable.Banner);

            md.i_InsertDateTime = DateTime.Now;
            md.i_InsertDeptID = this.departmentId;
            md.i_InsertUserID = this.UserId;
            md.i_Lang = "zh-TW";
            r = new ResultInfo<AboutUs>();
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

                db0.AboutUs.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.aboutus_id;
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
                r = new ResultInfo<AboutUs>();
                foreach (var id in ids)
                {
                    item = new AboutUs() { aboutus_id = id };
                    db0.AboutUs.Attach(item);
                    db0.AboutUs.Remove(item);
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
    public class q_AboutUs : QueryBase
    {
        public string keyword { get; set; }
    }
}
