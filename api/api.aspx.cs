using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System;
using Satec.eXpertPower.Utilities;
using System.Web.Script.Serialization;

namespace Satec.eXpertPowerPlus.Web
{
    public partial class api : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler = new SessionHandler();
        private static JavaScriptSerializer js       = new JavaScriptSerializer();
        private static DBUtils dbUtils               = new DBUtils();

        [WebMethod]
        public static object init()
        {
            DataTable templatesDt;
            DataTable designsDt;

            templatesDt = dbUtils.FillDataSetTable("select * from test_billTemplates", "billTemplates").Tables[0];
            designsDt = dbUtils.FillDataSetTable("select * from test_BillTemplatesDesigns", "test_BillTemplatesDesigns").Tables[0];

            List<Dictionary<string, object>> templates = formatDataTable(templatesDt);
            List<Dictionary<string, object>> designs   = formatDataTable(designsDt);

            var d = new { 
                templates = templates,
                designs   = designs 
            };

            return js.Serialize(d);
        }

        [WebMethod]
        public static object getDesigns() {
            DataTable designsDt;
            designsDt = dbUtils.FillDataSetTable("select * from test_BillTemplatesDesigns", "test_BillTemplatesDesigns").Tables[0];
            List<Dictionary<string, object>> designs = formatDataTable(designsDt);
            return js.Serialize(designs);
        }

        [WebMethod]
        public static object getDesign( string id )
        {
            DataTable designDt;
            designDt = dbUtils.FillDataSetTable("select * from test_BillTemplatesDesigns where ID = "+id, "test_BillTemplatesDesigns").Tables[0];
            List<Dictionary<string, object>> design = formatDataTable(designDt);
            return js.Serialize(design);
        }

        [WebMethod]
        public static object getTemplate(string id)
        {
            DataTable dt;
            dt = dbUtils.FillDataSetTable("select * from test_BillTemplates where ID = " + id, "test_BillTemplates").Tables[0];
            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }

        [WebMethod]
        public static object setupTemplate(String name, String height, String type, String designId)
        {
            string data = "";

            if (designId != "0")
            {
                DataTable designDt;
                designDt = dbUtils.FillDataSetTable("select * from test_BillTemplatesDesigns where ID = " + designId, "test_BillTemplatesDesigns").Tables[0];
                List<Dictionary<string, object>> design = formatDataTable(designDt);
                data = designDt.Rows[0]["Data"].ToString();
            }

            string query = @"insert into test_BillTemplates (UserId,Name,Height,Type,Data,Active) VALUES (" + sessionHandler.UserID + ",'" + name + "'," + height + ",'" + type + "',N'" + data + "',0);";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object setupDesign(String name,String type,String height)
        {
            string query = @"insert into test_BillTemplatesDesigns (Name,Height,Type,Data,Active) VALUES ('" + name + "'," + height + ",'" + type + "','',1);";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object removeDesign(String id)
        {
            string query = @"delete from test_BillTemplatesDesigns WHERE ID="+id+";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object removeTemplate(String id)
        {
            string query = @"delete from test_BillTemplates WHERE ID="+id+";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object saveDesign(String id, String data)
        {
            string query = @"update test_BillTemplatesDesigns SET Data = N'"+data+"' WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object saveTemplate(String id, String data, String html)
        {
            string query = @"update test_BillTemplates SET Data = N'" + data + "', Html = N'"+html+"' WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object setActiveTemplate(String id, String type, String active)
        {
            string query = @"update test_billTemplates set Active = 0 where Type='" + type + "';";
            int result1;
            result1 = dbUtils.ExecNonQuery(query);

            query = @"update test_BillTemplates SET Active = "+active+" where ID = "+id+" ;";
            int result2;
            result2 = dbUtils.ExecNonQuery(query);
            return js.Serialize(result2);
        }

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
