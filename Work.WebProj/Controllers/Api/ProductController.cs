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
    public class ProductController : ajaxApi<Product, q_Product>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.Product.FindAsync(id);
                r = new ResultInfo<Product>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Product q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.Product
                    .OrderByDescending(x => x.sort)
                    .Select(x => new m_Product()
                    {
                        product_id = x.product_id,
                        l1_id = x.l1_id,
                        l2_id = x.l2_id,
                        l3_id = x.l3_id,
                        l1_name = x.Product_Category_L1.l1_name,
                        l2_name = x.Product_Category_L2.l2_name,
                        l3_name = x.Product_Category_L3.l3_name,
                        power = x.power,
                        sort = x.sort,
                        i_Hide = x.i_Hide,
                        i_Lang = x.i_Lang
                    });
                if (q.keyword != null)
                {
                    items = items.Where(x => x.power.Contains(q.keyword));
                }
                if (q.i_Lang != null)
                {
                    items = items.Where(x => x.i_Lang == q.i_Lang);
                }
                if (q.category_l1 != null)
                {
                    items = items.Where(x => x.l1_id == q.category_l1);
                }
                if (q.category_l2 != null)
                {
                    items = items.Where(x => x.l2_id == q.category_l2);
                }
                if (q.category_l3 != null)
                {
                    items = items.Where(x => x.l3_id == q.category_l3);
                }

                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok(new GridInfo<m_Product>()
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
        public async Task<IHttpActionResult> Put([FromBody]Product md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.Product.FindAsync(md.product_id);

                item.l1_id = md.l1_id;
                item.l2_id = md.l2_id;
                item.l3_id = md.l3_id;
                item.power = md.power;
                item.feature = md.feature;
                item.technical_specification = md.technical_specification;
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
        public async Task<IHttpActionResult> Post([FromBody]Product md)
        {
            md.product_id = GetNewId(CodeTable.Product);

            md.i_InsertDateTime = DateTime.Now;
            md.i_InsertDeptID = this.departmentId;
            md.i_InsertUserID = this.UserId;
            //md.i_Lang = "zh-TW";
            r = new ResultInfo<Product>();
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

                db0.Product.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.product_id;
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
                r = new ResultInfo<Product>();
                foreach (var id in ids)
                {
                    item = new Product() { product_id = id };
                    db0.Product.Attach(item);
                    db0.Product.Remove(item);
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
    public class q_Product : QueryBase
    {
        public string keyword { get; set; }
        public string i_Lang { get; set; }
        public int? category_l1 { get; set; }
        public int? category_l2 { get; set; }
        public int? category_l3 { get; set; }
    }
}
