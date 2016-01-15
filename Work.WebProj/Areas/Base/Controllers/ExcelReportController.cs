using DotWeb.Controller;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using ProcCore.Business.DB0;
using ProcCore.Business.LogicConect;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DotWeb.Areas.Base.Controllers
{
    public class ExcelReportController : AdminController
    {
        // GET: ExcelReport
        public FileResult downloadExcel_SalesRankData()
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("SalesRankData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["SalesRankData"];

                sheet.View.TabSelected = true;
                #region 取得客戶拜訪紀錄
                var items = (from x in db0.Sales
                             orderby x.sales_no
                             select (new m_Sales()
                             {
                                 sales_no = x.sales_no,
                                 sales_name = x.sales_name,
                                 join_date = x.join_date,
                                 tel = x.tel,
                                 mobile = x.mobile,
                                 zip = x.zip,
                                 address = x.address,
                                 rank = x.rank,
                                 sub_count = x.SalesSub.Count()
                             }));


                var getPrintVal = items.ToList();


                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "符合經理人資格之會員名單";
                sheet.Cells[1, 1, 1, 9].Merge = true;
                sheet.Cells[2, 1].Value = "[會員編號]";
                sheet.Cells[2, 2].Value = "[會員名稱]";
                sheet.Cells[2, 3].Value = "[加入日期]";
                sheet.Cells[2, 4].Value = "[電話]";
                sheet.Cells[2, 5].Value = "[手機]";
                sheet.Cells[2, 6].Value = "[郵遞區號]";
                sheet.Cells[2, 7].Value = "[地址]";
                sheet.Cells[2, 8].Value = "[會員階級]";
                sheet.Cells[2, 9].Value = "[直推會員數]";
                setFontColor_Label(sheet, 2, 1, 9);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {

                    sheet.Cells[detail_row, 1].Value = item.sales_no;
                    sheet.Cells[detail_row, 2].Value = item.sales_name;
                    sheet.Cells[detail_row, 3].Value = item.join_date.ToString("yyyy/MM/dd");
                    sheet.Cells[detail_row, 4].Value = item.tel;
                    sheet.Cells[detail_row, 5].Value = item.mobile;
                    sheet.Cells[detail_row, 6].Value = item.zip;
                    sheet.Cells[detail_row, 7].Value = item.address;
                    sheet.Cells[detail_row, 8].Value = CodeSheet.GetStateVal(item.rank, CodeSheet.sales_rank);
                    sheet.Cells[detail_row, 9].Value = item.sub_count;

                    detail_row++;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "會員推薦人數" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_SalesData()
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("SalesData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["SalesData"];

                sheet.View.TabSelected = true;
                #region 取得客戶資料
                var items = (from x in db0.Sales
                             orderby x.sales_no
                             where x.sales_no != "A"
                             select (new m_Sales()
                             {
                                 sales_no = x.sales_no,
                                 sales_name = x.sales_name,
                                 tel = x.tel,
                                 mobile = x.mobile,
                                 zip = x.zip,
                                 address = x.address
                             }));


                var getPrintVal = items.ToList();


                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "會員名單";
                sheet.Cells[1, 1, 1, 4].Merge = true;
                sheet.Cells[2, 1].Value = "[姓名]";
                sheet.Cells[2, 2].Value = "[手機]";
                sheet.Cells[2, 3].Value = "[郵遞區號]";
                sheet.Cells[2, 4].Value = "[地址]";
                setFontColor_Label(sheet, 2, 1, 4);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {

                    sheet.Cells[detail_row, 1].Value = item.sales_name;
                    sheet.Cells[detail_row, 2].Value = item.mobile;
                    sheet.Cells[detail_row, 3].Value = item.zip;
                    sheet.Cells[detail_row, 4].Value = item.address;

                    detail_row++;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "會員名單" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 列印出貨三聯單
        /// </summary>
        /// <param name="no">訂單編號</param>
        /// <returns></returns>
        public FileResult downloadExcel_PurchaseData(string no)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("出貨三聯單");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["出貨三聯單"];

                sheet.View.TabSelected = true;
                #region 取得客戶銷售紀錄
                var item = db0.Purchase.Find(no);
                item.sales_name = item.Sales.sales_name;
                #endregion


                #region Excel Handle

                int detail_row = 6;

                #region 內容

                #region 標題
                sheet.Cells[1, 1].Value = "訂單編號:" + no + "-出貨三聯單";
                sheet.Cells[1, 1, 1, 10].Merge = true;
                sheet.Cells[2, 1].Value = "[訂單編號]";
                sheet.Cells[2, 2].Value = "[會員名稱]";
                sheet.Cells[2, 3].Value = "[購買日期]";
                sheet.Cells[2, 4].Value = "[總計金額(含運費)]";
                sheet.Cells[2, 5].Value = "[運費]";
                sheet.Cells[2, 6].Value = "[收件人]";
                sheet.Cells[2, 7].Value = "[電話]";
                sheet.Cells[2, 8].Value = "[手機]";
                sheet.Cells[2, 9].Value = "[地址]";
                sheet.Cells[2, 10].Value = "[備註]";
                setFontColor_Label(sheet, 2, 1, 10);
                setFontColorAndBg_Blue(sheet, 1, 1);
                #endregion

                sheet.Cells[3, 1].Value = item.purchase_no;
                sheet.Cells[3, 2].Value = item.sales_name;
                sheet.Cells[3, 3].Value = item.set_date.ToString("yyyy/MM/dd");
                sheet.Cells[3, 4].Value = item.total;
                sheet.Cells[3, 5].Value = item.shipping_fee;
                sheet.Cells[3, 6].Value = item.receive_person;
                sheet.Cells[3, 7].Value = item.receive_tel;
                sheet.Cells[3, 8].Value = item.receive_mobile;
                sheet.Cells[3, 9].Value = item.receive_zip + " " + item.receive_address;
                sheet.Cells[3, 10].Value = item.receive_memo;

                #region 次標題
                sheet.Cells[4, 3].Value = "產品購買清單";
                sheet.Cells[4, 3, 4, 8].Merge = true;
                sheet.Cells[5, 3].Value = "[項次]";
                sheet.Cells[5, 4].Value = "[品號]";
                sheet.Cells[5, 5].Value = "[品名]";
                sheet.Cells[5, 6].Value = "[單價]";
                sheet.Cells[5, 7].Value = "[數量]";
                sheet.Cells[5, 8].Value = "[小計]";
                setFontColor_Label(sheet, 5, 3, 8);
                setFontColorAndBg_DeepSkyBlue(sheet, 4, 3);
                #endregion
                foreach (var detail in item.PurchaseDetail)
                {

                    sheet.Cells[detail_row, 3].Value = detail.item_no;
                    sheet.Cells[detail_row, 4].Value = detail.product_no;
                    sheet.Cells[detail_row, 5].Value = detail.product_name;
                    sheet.Cells[detail_row, 6].Value = detail.price;
                    sheet.Cells[detail_row, 7].Value = detail.qty;
                    sheet.Cells[detail_row, 8].Value = detail.sub_total;

                    detail_row++;
                }
                int copy_range = detail_row - 1;
                for (int i = 0; i < 2; i++)
                {
                    sheet.Cells["A1:J" + copy_range].Copy(sheet.Cells[detail_row, 1, detail_row + copy_range - 1, 10]);
                    detail_row += copy_range;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "[" + no + "]出貨三聯單" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 銷售明細總表
        /// </summary>
        /// <param name="no"></param>
        /// <returns></returns>
        public FileResult downloadExcel_PurchaseDataAll(ParmGetAllPurchase q)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("銷售明細總表");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["銷售明細總表"];
                string date_range = "All";
                sheet.View.TabSelected = true;
                #region 取得客戶銷售紀錄
                var items = db0.Purchase.AsQueryable();
                if (q.start_date != null && q.end_date != null)
                {
                    DateTime end = ((DateTime)q.end_date).AddDays(1);
                    items = items.Where(x => x.set_date >= q.start_date && x.set_date < end);
                    date_range = "(" + ((DateTime)q.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)q.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (q.keyword != null)
                {
                    items = items.Where(x => x.purchase_no
                    .StartsWith(q.keyword) || x.sales_name.StartsWith(q.keyword));
                }
                if (q.source != null)
                {
                    items = items.Where(x => x.source == q.source);
                }
                if (q.state != null)
                {
                    items = items.Where(x => x.state == q.state);
                }
                var print = items.ToList();
                #endregion


                #region Excel Handle

                int detail_row = 2;

                #region 內容

                #region 總標題
                sheet.Cells[1, 1].Value = "銷售明細總表" + date_range;
                sheet.Cells[1, 1, 1, 10].Merge = true;
                setFontColorAndBg_Blue(sheet, 1, 1);
                #endregion


                foreach (var item in print)
                {
                    #region 主標題
                    sheet.Cells[detail_row, 1].Value = "[訂單編號]";
                    sheet.Cells[detail_row, 2].Value = "[會員名稱]";
                    sheet.Cells[detail_row, 3].Value = "[購買日期]";
                    sheet.Cells[detail_row, 4].Value = "[總計金額(含運費)]";
                    sheet.Cells[detail_row, 5].Value = "[運費]";
                    sheet.Cells[detail_row, 6].Value = "[收件人]";
                    sheet.Cells[detail_row, 7].Value = "[電話]";
                    sheet.Cells[detail_row, 8].Value = "[手機]";
                    sheet.Cells[detail_row, 9].Value = "[地址]";
                    sheet.Cells[detail_row, 10].Value = "[備註]";
                    setFontColor_Label(sheet, detail_row, 1, 10);
                    detail_row++;
                    #endregion
                    sheet.Cells[detail_row, 1].Value = item.purchase_no;
                    sheet.Cells[detail_row, 2].Value = item.sales_name;
                    sheet.Cells[detail_row, 3].Value = item.set_date.ToString("yyyy/MM/dd");
                    sheet.Cells[detail_row, 4].Value = item.total;
                    sheet.Cells[detail_row, 5].Value = item.shipping_fee;
                    sheet.Cells[detail_row, 6].Value = item.receive_person;
                    sheet.Cells[detail_row, 7].Value = item.receive_tel;
                    sheet.Cells[detail_row, 8].Value = item.receive_mobile;
                    sheet.Cells[detail_row, 9].Value = item.receive_zip + " " + item.receive_address;
                    sheet.Cells[detail_row, 10].Value = item.receive_memo;

                    detail_row++;

                    #region 次標題
                    sheet.Cells[detail_row, 3].Value = "產品購買清單";
                    sheet.Cells[detail_row, 3, detail_row, 8].Merge = true;
                    setFontColorAndBg_DeepSkyBlue(sheet, detail_row, 3);
                    detail_row++;
                    sheet.Cells[detail_row, 3].Value = "[項次]";
                    sheet.Cells[detail_row, 4].Value = "[品號]";
                    sheet.Cells[detail_row, 5].Value = "[品名]";
                    sheet.Cells[detail_row, 6].Value = "[單價]";
                    sheet.Cells[detail_row, 7].Value = "[數量]";
                    sheet.Cells[detail_row, 8].Value = "[小計]";
                    setFontColor_Label(sheet, detail_row, 3, 8);
                    detail_row++;

                    #endregion
                    foreach (var detail in item.PurchaseDetail)
                    {
                        sheet.Cells[detail_row, 3].Value = detail.item_no;
                        sheet.Cells[detail_row, 4].Value = detail.product_no;
                        sheet.Cells[detail_row, 5].Value = detail.product_name;
                        sheet.Cells[detail_row, 6].Value = detail.price;
                        sheet.Cells[detail_row, 7].Value = detail.qty;
                        sheet.Cells[detail_row, 8].Value = detail.sub_total;

                        detail_row++;
                    }


                    detail_row++;
                }

                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "銷售明細總表" + date_range + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }

        public FileResult downloadExcel_SettleData(ParmGetSettleData q)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("獎金核算");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["獎金核算"];
                sheet.View.TabSelected = true;
                #region 取得獎金核算資料
                var item = db0.Settle.Find(q.main_id);
                var itemDetails = item.SettleDetail.ToList();
                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 內容

                #region 標題
                sheet.Cells[1, 1].Value = string.Format("{0}年{1}月 獎金核算", item.y, item.m);
                sheet.Cells[1, 1, 1, 10].Merge = true;
                setFontColorAndBg_Blue(sheet, 1, 1);

                sheet.Cells[2, 1].Value = "[會員編號]";
                sheet.Cells[2, 2].Value = "[姓名]";
                sheet.Cells[2, 3].Value = "[級別]";
                sheet.Cells[2, 4].Value = "[kv]";
                sheet.Cells[2, 5].Value = "[共享圈總kv]";
                sheet.Cells[2, 6].Value = "[累積回饋獎金]";
                sheet.Cells[2, 7].Value = "[回饋獎金]";
                sheet.Cells[2, 8].Value = "[經營獎金]";
                sheet.Cells[2, 9].Value = "[營運紅利]";
                sheet.Cells[2, 10].Value = "[管理紅利]";
                setFontColor_Label(sheet, 2, 1, 10);
                #endregion


                foreach (var detail in itemDetails)
                {
                    sheet.Cells[detail_row, 1].Value = detail.sales_no;
                    sheet.Cells[detail_row, 2].Value = detail.sales_name;
                    sheet.Cells[detail_row, 3].Value = CodeSheet.GetStateVal(detail.rank, CodeSheet.sales_rank);
                    sheet.Cells[detail_row, 4].Value = detail.kv_p_sum;//個人kv總計
                    sheet.Cells[detail_row, 5].Value = detail.kv_g_sum;
                    sheet.Cells[detail_row, 6].Value = detail.b;
                    sheet.Cells[detail_row, 7].Value = detail.a;
                    sheet.Cells[detail_row, 8].Value = detail.bound;
                    sheet.Cells[detail_row, 9].Value = detail.center_bonus;
                    sheet.Cells[detail_row, 10].Value = detail.office_bonus;

                    detail_row++;
                }

                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = item.y + "年" + item.m + "月獎金核算" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }

        public void setCellBackgroundColor_MonthHead(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Size = 14;//文字大小設定14
            sheet.Cells[row, column].Style.Font.Name = "微軟正黑體";
            sheet.Cells[row, column].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.DeepSkyBlue);
        }
        public void setCellBackgroundColor_Label(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Fill.PatternType = ExcelFillStyle.Solid;
                sheet.Cells[row, start_column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightSkyBlue);
            }
        }
        public void setFontColor_Label(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Font.Bold = true;
                sheet.Cells[row, start_column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
                sheet.Cells[row, start_column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
        }
        public void setFontColor_LabelBord(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Font.Bold = true;
                sheet.Cells[row, start_column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
                sheet.Cells[row, start_column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                sheet.Cells[row, start_column].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);//儲存格框線
            }
        }
        public void setFontColor_blue(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setFontColor_red(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Red);
        }
        public void setFontColorAndBg_DeepSkyBlue(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.White);
            sheet.Cells[row, column].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.DeepSkyBlue);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setFontColorAndBg_Blue(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.White);
            sheet.Cells[row, column].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Blue);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setMerge_label(ExcelWorksheet sheet, int start_row, int end_row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[start_row, start_column, end_row, start_column].Merge = true;
            }
        }
        public void setBroder_red(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Border.Top.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
            }
        }
        /// <summary>
        /// excel 換行設定 
        /// </summary>
        /// <param name="sheet"></param>
        /// <param name="row"></param>
        /// <param name="start_column"></param>
        /// <param name="end_column"></param>
        public void setWrapText(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.WrapText = true;
            }
        }
    }
    public class PQList
    {
        public int p_id { get; set; }
        public decimal qty { get; set; }
    }
    public class SalesList
    {
        public string Name { get; set; }
        public IList<ProductList> items { get; set; }
    }
    public class ProductList
    {
        public int product_id { get; set; }
        public string product_name { get; set; }
        public bool have { get; set; }
        public decimal Sum { get; set; }
    }
    public class ParmGetAllPurchase
    {
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public string keyword { get; set; }
        public int? source { get; set; }
        public int? state { get; set; }
    }
    public class ParmGetSettleData
    {
        public int main_id { get; set; }
    }
}