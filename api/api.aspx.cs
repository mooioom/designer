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
        private static SessionHandler            sessionHandler;
        private static JavaScriptSerializer js = new JavaScriptSerializer();
        private static DBUtils dbUtils         = new DBUtils();

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
        public static object setupTemplate( String designId )
        {
            return js.Serialize(designId);
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
