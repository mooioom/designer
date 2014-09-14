using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System;
using Satec.eXpertPower.Utilities;
using System.Web.Script.Serialization;
using System.Data.SqlClient;
using Satec.eXpertPowerPlus.BL;
using HtmlAgilityPack;

namespace Satec.eXpertPowerPlus.Web
{
    public partial class api : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler = new SessionHandler();
        private static JavaScriptSerializer js       = new JavaScriptSerializer();
        private static DBUtils dbUtils               = new DBUtils();
        
        // <invoiceLayout.aspx>
        // --------------------
        [WebMethod]
        public static object initLayout()
        {
            return js.Serialize(new BillTemplateBL(sessionHandler.LangID).initLayout(sessionHandler.CustomerID));
        }

        [WebMethod]
        public static object getTemplateData(string type, int id, int isAudited)
        {
            DataTable dt = new BillTemplateBL(sessionHandler.LangID).getTemplateData(sessionHandler.CustomerID, type, id, isAudited);
            List<Dictionary<string, object>> data = formatDataTable(dt);
            return js.Serialize(data);
        }

        [WebMethod]
        public static object setTemplate(string type, int id)
        {
            return js.Serialize(new { 
                success = new BillTemplateBL(sessionHandler.LangID).setTemplate(sessionHandler.CustomerID, type, id) 
            });
        }
        //</invoiceLayout.aspx>

        // <Template Editor>
        // -----------------
        [WebMethod]
        public static object getTemplate(int id, string type, int isAudited)
        {
            DataTable dt = new DataTable();
            if (isAudited == 0) dt = new BillTemplateBL(sessionHandler.LangID).getDesign(type, id); 
            else                dt = new BillTemplateBL(sessionHandler.LangID).getTemplate(sessionHandler.CustomerID, type);

            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }

        [WebMethod]
        public static object saveTemplate(String id, String type, String height, String data, String html)
        {
            string query = @"update test_BillTemplates 
                           SET DesignId = "+id+", Height = "+ height +", Data = N'" + data + "', Html = N'" + html + 
                           "' WHERE CustomerId=" + sessionHandler.CustomerID + " and Type = '"+type+"';";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object saveGrid(String id, String cell, String cellText, String header, String headerText, String total, String totalText, String border)
        {
            string query = @"update test_BillTemplateGrids 
                           SET Cell = @cell, CellText = '" + cellText + "', Header = '" + header + "', HeaderText = '" + headerText +
                           "', Total = '"+ total +"', TotalText = '" + totalText + "', Border = '" + border + "', DesignId = " + id + " WHERE CustomerId = " + sessionHandler.CustomerID;
            int result;
            result = dbUtils.ExecNonQuery(query, new List<System.Data.SqlClient.SqlParameter>
                {
                    new SqlParameter("cell",cell)
                });
            return js.Serialize(result);
        }

        [WebMethod]
        public static object getHtml(string html)
        {
            return js.Serialize(new { html = html });
        }

        [WebMethod]
        public static Object StringsByIDLang(int id)
        {
            string query = @"select 
	                        st.Text,
	                        ISNULL(st2.Text, Description) Description
                        from StringsText st 
	                        join ListOfLanguages lol on st.Language = lol.ID
	                        left join  StringsText st2 on st2.StringId = lol.StringId and st2.Language = " + sessionHandler.LangID + @"
                        where st.StringId = " + id.ToString();

            DataTable dt;

            dt = dbUtils.FillDataSetTable(query, "strings").Tables[0];
            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }
        //</Template Editor>

        //<Template Editor - Admin>
        //-------------------------
        [WebMethod]
        public static object getDesigns()
        {
            DataTable designsDt;
            js.MaxJsonLength = Int32.MaxValue;
            designsDt = dbUtils.FillDataSetTable("select * from test_BillTemplatesDesigns", "test_BillTemplatesDesigns").Tables[0];
            List<Dictionary<string, object>> designs = formatDataTable(designsDt);
            return js.Serialize(designs);
        }

        [WebMethod]
        public static object getDesign(string type, int id)
        {
            DataTable dt = new BillTemplateBL(sessionHandler.LangID).getDesign(type, id);
            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }

        [WebMethod]
        public static object saveDesign(String id, String data, String html)
        {
            string query = @"update test_BillTemplatesDesigns SET Data = N'" + data + "', Html = N'" + html + "' WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object setupDesign(String name, String type, String height)
        {
            string query = @"insert into test_BillTemplatesDesigns (Name,Height,Type,Data,Active) VALUES ('" + name + "'," + height + ",'" + type + "','',1);";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object removeDesign(String id)
        {
            string query = @"delete from test_BillTemplatesDesigns WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }
        //</Template Editor - Admin>

        public static List<Dictionary<string, object>> formatDataTable(DataTable dt)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row = null;
            foreach (DataRow dr in dt.Rows)
            {
                row = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                rows.Add(row);
            }
            return rows;
        }
    }
}
