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
            js.MaxJsonLength = Int32.MaxValue;
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
        public static object saveDesign(String id, String data, String html)
        {
            string query = @"update test_BillTemplatesDesigns SET Data = N'"+data+"', Html = N'"+html+"' WHERE ID=" + id + ";";
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

        /* New api */

        [WebMethod]
        public static object getTemplate(string id, string type, string isAudited)
        {
            string query;
            DataTable dt;

            if (isAudited == "0")
            {
                //return the design
                query = "select * from test_BillTemplatesDesigns where Type = '" + type + "' and ID = " + id;
            }
            else { 
                query = "select * from test_BillTemplates where Type = '" + type + "' and CustomerId = " + sessionHandler.CustomerID;
            }
            
            dt = dbUtils.FillDataSetTable(query, "test_BillTemplates").Tables[0];
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
        public static object initLayout()
        {
            // check tables for data
            DataTable dtHeader, dtFooter, dtGrid, dtHeaderDesigns,dtGridDesigns,dtFooterDesigns;

            int initialSetup = 0;

            dtHeader = dbUtils.FillDataSetTable("select DesignId, CASE WHEN Html IS NULL THEN 0 ELSE 1 END AS Audited from test_BillTemplates where CustomerId = "+sessionHandler.CustomerID+" and Type = 'header'", "test_BillTemplates").Tables[0];
            dtGrid   = dbUtils.FillDataSetTable("select DesignId from test_BillTemplateGrids where CustomerId = " + sessionHandler.CustomerID, "test_BillTemplateGrids").Tables[0];
            dtFooter = dbUtils.FillDataSetTable("select DesignId, CASE WHEN Html IS NULL THEN 0 ELSE 1 END AS Audited from test_BillTemplates where CustomerId = " + sessionHandler.CustomerID + " and Type = 'footer'", "test_BillTemplates").Tables[0];

            List<Dictionary<string, object>> header = formatDataTable(dtHeader);
            List<Dictionary<string, object>> grid   = formatDataTable(dtGrid);
            List<Dictionary<string, object>> footer = formatDataTable(dtFooter);

            //if nothing found setup initial values
            if (dtHeader.Rows.Count == 0)
            {
                string query = "insert into test_BillTemplates (Type,CustomerId) Values ('header'," + sessionHandler.CustomerID + ");";
                initialSetup = dbUtils.ExecNonQuery(query);
            }
            if (dtGrid.Rows.Count == 0)
            {
                string query = "insert into test_BillTemplateGrids (CustomerId) Values (" + sessionHandler.CustomerID + ");";
                initialSetup = dbUtils.ExecNonQuery(query);
            }
            if (dtFooter.Rows.Count == 0)
            {
                string query = "insert into test_BillTemplates (Type,CustomerId) Values ('footer'," + sessionHandler.CustomerID + ");";
                initialSetup = dbUtils.ExecNonQuery(query);
            }

            //get design options

            dtHeaderDesigns = dbUtils.FillDataSetTable("select ID, Type, Name, IsDefault from test_BillTemplatesDesigns where Type = 'header' AND Active = 1 order by IsDefault DESC", "test_BillTemplatesDesigns").Tables[0];
            dtGridDesigns   = dbUtils.FillDataSetTable("select ID, Name, IsDefault from test_BillTemplateGridsDesigns where Active = 1 order by IsDefault DESC", "test_BillTemplateGridsDesigns").Tables[0];
            dtFooterDesigns = dbUtils.FillDataSetTable("select ID, Type, Name, IsDefault from test_BillTemplatesDesigns where Type = 'footer' AND Active = 1 order by IsDefault DESC", "test_BillTemplatesDesigns").Tables[0];

            List<Dictionary<string, object>> headerDesigns = formatDataTable(dtHeaderDesigns);
            List<Dictionary<string, object>> gridDesigns   = formatDataTable(dtGridDesigns);
            List<Dictionary<string, object>> footerDesigns = formatDataTable(dtFooterDesigns);

            //if none create from default template
            return js.Serialize(new 
            {
                header        = header,
                footer        = footer,
                grid          = grid,
                headerDesigns = headerDesigns,
                gridDesigns   = gridDesigns,
                footerDesigns = footerDesigns,
                initialSetup  = initialSetup
            });
        }

        [WebMethod]
        public static object switchTemplate(String type, String id)
        {
            String t = "";
            String typeString = " and Type='" + type + "'";

            if (type == "header" || type == "footer") t = "test_BillTemplates";
            if (type == "grid") { t = "test_BillTemplateGrids"; typeString = ""; }

            string query = "update " + t + " set DesignId = " + id + ", Html = null, Data = null, Height = null WHERE CustomerId = " + sessionHandler.CustomerID + typeString;

            int result = dbUtils.ExecNonQuery(query);
            return js.Serialize(new{success = result});
        }

        [WebMethod]
        public static object getTemplateData(String type, String id, String isAudited)
        {
            String queryDefault;
            String queryDesign;
            String query;
            DataTable dt = new DataTable();
            List<Dictionary<string, object>> data;

            if(type == "header" || type == "footer")
            {
                queryDefault = "select top 1 Html from test_BillTemplatesDesigns where isDefault = '1' and Type = '" + type + "';";
                query        = "select top 1 Html from test_BillTemplates where Type = '" + type + "' AND CustomerId = " + sessionHandler.CustomerID;
                queryDesign  = "select top 1 Html from test_BillTemplatesDesigns where ID = " + id + " and Type='" + type + "'";
                if (isAudited != "0")
                {
                    // get user data
                    if (id != "0")
                    {
                        dt = dbUtils.FillDataSetTable(query, "test_BillTemplates").Tables[0];
                        if (dt.Rows[0]["Html"].ToString() == "") dt = dbUtils.FillDataSetTable(queryDefault, "test_BillTemplates").Tables[0];
                    }
                    else dt = dbUtils.FillDataSetTable(queryDefault, "test_BillTemplates").Tables[0];
                }
                else
                {
                    if (id != "0") 
                    {
                        dt = dbUtils.FillDataSetTable(queryDesign, "test_BillTemplates").Tables[0];
                    }
                    else dt = dbUtils.FillDataSetTable(query, "test_BillTemplates").Tables[0];
                }
                
            }
            if (type == "grid") 
            {
                queryDefault = "select top 1 * from test_BillTemplateGridsDesigns where isDefault = '1'";
                query        = "select top 1 * from test_BillTemplateGrids where CustomerId = " + sessionHandler.CustomerID;
                queryDesign  = "select top 1 * from test_BillTemplateGridsDesigns where ID = " + id;
                if (isAudited != "0")
                {
                    if (id != "0")
                    {
                        dt = dbUtils.FillDataSetTable(query, "test_BillTemplateGrids").Tables[0];
                        if (dt.Rows[0]["Cell"].ToString() == "") dt = dbUtils.FillDataSetTable(queryDefault, "test_BillTemplateGridsDesigns").Tables[0];
                    }
                    else dt = dbUtils.FillDataSetTable(queryDefault, "test_BillTemplateGridsDesigns").Tables[0];
                }
                else
                {
                    dt = dbUtils.FillDataSetTable(queryDesign, "test_BillTemplateGrids").Tables[0];
                }
                
            }
            data = formatDataTable(dt);
            return js.Serialize(data);
        }

        [WebMethod]
        public static object getTemplateHtml(String id)
        {
            return js.Serialize(id);
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
