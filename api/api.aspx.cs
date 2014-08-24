using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using Satec.eXpertPower.Utilities;

namespace Satec.eXpertPowerPlus.Web
{
    public partial class api : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler;

        [WebMethod]
        public static object init()
        {
            SessionHandler sessionHandler = new SessionHandler();
            DBUtils dbUtils = new DBUtils();

            DataTable dt;

            dt = dbUtils.FillDataSetTable("select * from test_billTemplates", "billTemplates").Tables[0];

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

            string json = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(rows);
            return json;
        }
    }
}
