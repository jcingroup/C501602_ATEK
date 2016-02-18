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
    public class ProductCertificateController : ajaxApi<ProductCertificate, q_ProductCertificate>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.ProductCertificate.FindAsync(id);
                r = new ResultInfo<ProductCertificate>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_ProductCertificate q)
        {
            #region working

            using (db0 = getDB0())
            {
                var items = db0.ProductCertificate
                    .Where(x => x.product_id == q.product_id)
                    .OrderBy(x => x.sort)
                    .Select(x => new m_ProductCertificate()
                    {
                        product_id = x.product_id,
                        product_certificate_id = x.product_certificate_id,
                        name = x.name,
                        sort = x.sort
                    });

                return Ok(await items.ToListAsync());
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]ProductCertificate md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.ProductCertificate.FindAsync(md.product_certificate_id);

                item.name = item.name;

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
        public async Task<IHttpActionResult> Post([FromBody]ProductCertificate md)
        {
            md.product_certificate_id = GetNewId(CodeTable.ProductCertificate);

            r = new ResultInfo<ProductCertificate>();
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

                db0.ProductCertificate.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.product_certificate_id;
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
        public async Task<IHttpActionResult> Delete([FromUri]int id)
        {
            try
            {
                db0 = getDB0();
                r = new ResultInfo<ProductCertificate>();

                item = new ProductCertificate() { product_certificate_id = id };
                db0.ProductCertificate.Attach(item);
                db0.ProductCertificate.Remove(item);

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
    public class q_ProductCertificate : QueryBase
    {
        public int product_id { get; set; }
    }
}
