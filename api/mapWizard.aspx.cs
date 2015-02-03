using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System;
using Satec.eXpertPower.Utilities;
using System.Web.Script.Serialization;
using System.Data.SqlClient;
using Satec.eXpertPowerPlus.BL;
using System.Linq;
using Satec.eXpertPowerPlus.BL.Maps;
using Satec.eXpertPowerPlus.Web;
using Satec.UtilsBL.xpwUtilities;
using System.Web;
using Satec.eXpertPowerPlus.DB.Readings;


namespace Satec.eXpertPowerPlus.Web
{
    public partial class api : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler = new SessionHandler();
        private static JavaScriptSerializer js       = new JavaScriptSerializer();
        private static DBUtils dbUtils               = new DBUtils();

        public string mapList;
        private List<Map> maps
        {
            get
            {
                return (List<Map>)Session["maplist"];
            }
            set
            {
                Session["maplist"] = value;
            }
        }

        [WebMethod]
        public static object init()
        {
            int intLangID = sessionHandler.LangID;
            MapBL mapBl = new MapBL();
            List<Map> maps = mapBl.GetSvgMapsForUser(sessionHandler.UserID);
            string mapList = maps.Select(m => new
            {
                MapID = m.MapID,
                Title = m.Title
            }).ToJson(true);
            return js.Serialize(mapList);
        }

        [WebMethod]
        public static string checkMapName(string mapName) 
        {
            string query = string.Format("select count(*) from ListOfMapFiles where MapFile like '{0}'", mapName);
            return js.Serialize(new { invalid = new DBUtils().ExecSelectInt(query) > 0 });
        }

        [WebMethod(EnableSession = true)]
        public static string GetMapCode(int mapId)
        {
            MapBL mapBl = new MapBL();
            List<Map> maps = mapBl.GetSvgMapsForUser(sessionHandler.UserID);
            var map = maps.SingleOrDefault(m => m.MapID == mapId);
            return map.ToJson(true);
        }

        [WebMethod]
        public static string SaveMap(string mapTitle, string svg, object elements, object links)
        {
            var user           = GetCurrentUserObject();
            MapBL mapBl        = new MapBL();
            string elementsStr = elements.ToString();
            string linksStr    = links.ToString();
            var variables      = Json.ToObject<List<MapVariable>>(elementsStr);
            var mapLinks       = Json.ToObject<List<HtmlMapLink>>(linksStr);

            string result = mapBl.SaveMap(mapTitle, svg, variables, mapLinks, user.DefaultCustomer);

            if (result == "1") 
            {
                List<Map> maps = mapBl.GetSvgMapsForUser(sessionHandler.UserID);
                foreach (Map map in maps) {
                    if (map.Title == mapTitle) return map.MapID.ToString();
                }
            }else{
                return result;
            }
            return "";
        }

        [WebMethod]
        public static bool UpdateMap(int mapId, string mapTitle, string svg, object elements, object links)
        {
            var user = GetCurrentUserObject();
            MapBL mapBl = new MapBL();
            string elementsStr = elements.ToString();
            string linksStr = links.ToString();
            var variables = Json.ToObject<List<MapVariable>>(elementsStr);
            var mapLinks = Json.ToObject<List<HtmlMapLink>>(linksStr);

            return mapBl.UpdateMap(mapId, mapTitle, svg, variables, mapLinks, user.DefaultCustomer);

        }

        [WebMethod]
        public static string getDevices() {
            MapBL mapsBl = new MapBL();
            var devices = mapsBl.GetDevicesForUser(sessionHandler.UserID);
            return js.Serialize(devices);
        }

        [WebMethod]
        public static string GetParametersForDevice(int deviceId)
        {
            SessionHandler sessionHandler = new SessionHandler();
            MapBL mapBl = new MapBL();
            var list = mapBl.GetDeviceParameters(deviceId, sessionHandler.LangID);
            return list.ToJson();
        }

        [WebMethod]
        public static string GetBasicMeasurmentsFields(int deviceId) {
            SessionHandler sessionHandler = new SessionHandler();
            BasicDataBL basicBl = new BasicDataBL( sessionHandler.LangID );
            var fields = basicBl.GetBasicFields(deviceId);
            return fields.ToJson();
        }

        [WebMethod]
        public static string GetBasicMeasurments(int deviceId, string fields, int dateType, string dateFrom, string dateTo)
        {
            SessionHandler sessionHandler = new SessionHandler();
            BasicDataBL basicBl = new BasicDataBL(sessionHandler.LangID);
            DateTime from = DateTime.Now;
            DateTime to   = DateTime.Now;
            if (dateType == 1) { from = from.AddDays(-1);   }
            if (dateType == 2) { from = from.AddDays(-7);   }
            if (dateType == 3) { from = from.AddMonths(-1); }
            if (dateType == 4) { from = from.AddMonths(-6); }
            if (dateType == 5) { from = from.AddYears(-1);  }
            if (dateType == 6) { from = Convert.ToDateTime(dateFrom); to = Convert.ToDateTime(dateTo); }
            DataTable data = basicBl.GetBasicData(deviceId, from, to);
            DataTable outputTable = data.Clone();
            for (int i = data.Rows.Count - 1; i >= 0; i--){outputTable.ImportRow(data.Rows[i]);}
            List<Dictionary<string, object>> r = formatDataTable(outputTable);
            return js.Serialize(r);
        }

        [WebMethod]
        public static string GetLastReading(int deviceId) {
            SessionHandler sessionHandler = new SessionHandler();
            DateTime recordTime = DateTime.Now;
            BasicDataBL objBL = new BasicDataBL(sessionHandler.LangID);
            DataTable data = objBL.GetBasicData(deviceId, 1, eDirection.Prev, recordTime, true);
            List<Dictionary<string, object>> r = formatDataTable(data);
            return js.Serialize(r);
        }

        [WebMethod]
        public static string GetLastReadingMulti(int deviceId, string devicesIds) {
            SessionHandler sessionHandler = new SessionHandler();
            DateTime recordTime = DateTime.Now;
            var devices = devicesIds.Split(',').Select(n => int.Parse(n)).ToList();
            BasicDataBL objBL = new BasicDataBL(sessionHandler.LangID);
            DataTable data = objBL.GetDefaultMultiBasicData(deviceId, devices, 30, recordTime);
            List<Dictionary<string, object>> r = formatDataTable(data);
            return js.Serialize(r);
        }

        [WebMethod]
        public static string getMaxDemands(int deviceId, int dateType, ePeriodType resolution, string dateFrom, string dateTo)
        {
            SessionHandler sessionHandler = new SessionHandler();
            MaxDemandsDB maxdb = new MaxDemandsDB();
            DateTime from = DateTime.Now;
            DateTime to = DateTime.Now;
            if (dateType == 1) { from = from.AddDays(-1); }
            if (dateType == 2) { from = from.AddDays(-7); }
            if (dateType == 3) { from = from.AddMonths(-1); }
            if (dateType == 4) { from = from.AddMonths(-6); }
            if (dateType == 5) { from = from.AddYears(-1); }
            if (dateType == 6) { from = Convert.ToDateTime(dateFrom); to = Convert.ToDateTime(dateTo); }
            DataTable data = maxdb.getMaxDemandsData(deviceId, from, to, resolution);
            List<Dictionary<string, object>> r = formatDataTable(data);
            return js.Serialize(r);
        }

        [WebMethod]
        public static string getConsumption(string devicesIds, int dateType, ePeriodType resolution, string dateFrom, string dateTo)
        {
            SessionHandler sessionHandler = new SessionHandler();
            EnergyBL consBL = new EnergyBL(sessionHandler.LangID);
            bool f = false;
            int tableNum = 1;
            if (dateType > 4 && resolution.ToNullabeInt() == 4) tableNum = 0;
            List<int> devices = new List<int>();
            devices = devicesIds.Split(',').Select(n => int.Parse(n)).ToList();
            DateTime from = DateTime.Now;
            DateTime to = DateTime.Now;
            from = new DateTime(from.Year, from.Month, from.Day, 10, 0, 0);
            to   = new DateTime(to.Year, to.Month, to.Day, 10, 0, 0);

            if (dateType == 1) { from = from.AddDays(-1); }
            if (dateType == 2) { from = from.AddDays(-7); }
            if (dateType == 3) { from = from.AddMonths(-1); }
            if (dateType == 4) { from = from.AddMonths(-2); }
            if (dateType == 5) { from = from.AddMonths(-6); }
            if (dateType == 6) { from = from.AddYears(-1); }
            if (dateType == 7) { from = Convert.ToDateTime(dateFrom); to = Convert.ToDateTime(dateTo); }

            DataSet ConsDataSet = consBL.GetDataTablesForPeriod(devices, from, to, resolution, out f, out f, out f);

            if (ConsDataSet != null)
            {
                List<Dictionary<string, object>> r = formatDataTable(ConsDataSet.Tables[tableNum]);
                return js.Serialize(r);
            }
            else {
                return js.Serialize(false) ;
            }
            
        }

        [WebMethod]
        public static string getCustomers()
        {
            string query = @"PERMISSION.GetNavTreeObject_SP " + new SessionHandler().UserID;
            DataTable dt;
            dt = dbUtils.FillDataSetTable(query, "customers").Tables[0];
            List<Dictionary<string, object>> customers = formatDataTable(dt);
            return js.Serialize(customers);
        }

        [WebMethod]
        public static string getSites(int CustomerId)
        {
            string query = @"select * from CustomerSites cs 
	                        join ListOfSites los on los.SiteID = cs.SiteID 
	                        where CustomerID = "+CustomerId;
            DataTable dt;
            dt = dbUtils.FillDataSetTable(query, "sites").Tables[0];
            List<Dictionary<string, object>> sites = formatDataTable(dt);
            return js.Serialize(sites);
        }

        [WebMethod]
        public static string getSiteDevices(int SiteId)
        {
            string query = @"select * from DevicesInSites dis 
	                        join ListOfSites los on los.SiteID = dis.SiteID 
	                        join ListOfDevices lod on dis.DeviceID = lod.DeviceID 
	                        where dis.SiteID = " + SiteId;
            DataTable dt;
            dt = dbUtils.FillDataSetTable(query, "siteDevices").Tables[0];
            List<Dictionary<string, object>> siteDevices = formatDataTable(dt);
            return js.Serialize(siteDevices);
        }

        [WebMethod]
        public static string GetStrings(string Strings, int LangId)
        {
            string[] words;
            if (LangId == 0) LangId = new SessionHandler().CultureID;
            words = Strings.Split(new Char[] { ',' });
            List<Dictionary<string, string>> r = new List<Dictionary<string, string>>();
            Dictionary<string, string> b = null;
            DataTable dt = new DataTable();
            var type = typeof(Resources.Strings);
            foreach (string s in words)
            {
                string str = GetString(s, LangId);
                b = new Dictionary<string, string>();
                b.Add(s, str);
                r.Add(b);
            }
            return js.Serialize(r);
        }

        [WebMethod]
        public static object getMaps()
        {
            int intLangID = sessionHandler.LangID;
            MapBL mapBl = new MapBL();
            List<Map> maps = mapBl.GetSvgMapsForUser(sessionHandler.UserID);
            string mapList = maps.Select(m => new
            {
                MapID = m.MapID,
                Title = m.Title
            }).ToJson(true);
            return js.Serialize(mapList);
        }

        /* ENERGY MANAGER */

        [WebMethod]
        public static string getDashboards()
        {
            string query = @"select ems.ID,st.Text as Title,Type='system' from EnergyManagerSystemDashboards ems
                            join ListOfStrings los on(los.Name = ems.StringName)
                            join StringsText st on(st.StringId = los.ID)
                            where Language = @langID
                            union 
                            select emd.ID,emd.Name,Type='user' 
                            from EnergyManagerDashboards emd where emd.UserID = @userID
                            order by Type, ems.ID asc";
            DataTable dt;
            dt = dbUtils.FillDataSetTable(query, "systemDashboards", new List<SqlParameter>
            {
                new SqlParameter("langID", new SessionHandler().CultureID),
                new SqlParameter("userID", new SessionHandler().UserID),
            }).Tables[0];
            List<Dictionary<string, object>> systemDashboards = formatDataTable(dt);
            return js.Serialize(systemDashboards);
        }

        [WebMethod]
        public static string getWidgets(string type, int id)
        {
            string query;
            DataTable dt = new DataTable();
            if (type == "system") 
            {
                query = @"select ems.ID, st.Text as Title, Type = 'system', ems.WidgetPlayerCode, '' as SystemWidgetsID from EnergyManagerSystemWidgets ems
                        join ListOfStrings los on(los.Name = ems.StringName)
                        join StringsText st on(st.StringId = los.ID)
                        where Language = @langID and SystemDashboardsID = @SystemDashboardsID
                        union 
                        select em.ID, em.Title, Type = 'user', em.WidgetPlayerCode, em.SystemWidgetsID from EnergyManagerWidgets em
                        where em.UserID = @userID and em.SystemDashboardsID = @SystemDashboardsID
                        order by Type";
                dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>
                {
                    new SqlParameter("langID", new SessionHandler().CultureID),
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("SystemDashboardsID", id),
                }).Tables[0];
            }
            if (type == "user") 
            {
                query = @"select em.ID, em.Title, Type = 'user', em.WidgetPlayerCode, em.SystemWidgetsID from EnergyManagerWidgets em
                        where em.UserID = @userID and em.DashboardsID = @DashboardsID
                        order by Type";
                dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>
                {
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("DashboardsID", id),
                }).Tables[0];
            }

            List<Dictionary<string, object>> widgets = formatDataTable(dt);
            return js.Serialize(widgets);
        }

        [WebMethod]
        public static string getDashboardState(string type, int id)
        {
            string col = "";
            if (type == "system") col = "SystemDashboardsID";
            if (type == "user") col = "DashboardsID";
            var query = "SELECT TOP 1 State FROM EnergyManagerStates where " + col + " = @id AND UserID = @userID";
            DataTable dt = new DataTable();
            dt = dbUtils.FillDataSetTable(query, "states", new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            }).Tables[0];
            List<Dictionary<string, object>> state = formatDataTable(dt);
            return js.Serialize(state);
        }

        [WebMethod]
        public static string setDashboardState(string type, int id, string state)
        {
            string col = "";
            if (type == "system") col = "SystemDashboardsID";
            if (type == "user")   col = "DashboardsID";
            var query = "SELECT TOP 1 ID FROM EnergyManagerStates where " + col + " = @id AND UserID = @userID";
            DataTable dt = new DataTable();
            dt = dbUtils.FillDataSetTable(query, "states", new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            }).Tables[0];
            if (dt.Rows.Count < 1)
            {
                // create
                query = "INSERT INTO EnergyManagerStates (UserID," + col + ",State) values (@userID,@id,@state)";
                var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("state", state.ToString()),
                    new SqlParameter("id", id)
                });
                return a.ToString();
            }
            else { 
                // update
                query = "UPDATE EnergyManagerStates set State = @state where UserID = @userID and " + col + " = @id";
                var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("state", state.ToString()),
                    new SqlParameter("id", id)
                });
                return a.ToString();
            }

        }

        [WebMethod]
        public static string saveWidget(string dashboardType, int dashboardId, string type, int id, string code, string title)
        {
            var query = "";
            var col   = "";
            DataTable dt = new DataTable();
            if (dashboardType == "user") { col = "DashboardsID"; };
            if (dashboardType == "system") { col = "SystemDashboardsID"; };
            if (type == "system") {
                // create new user widget with SystemWidgetsID like id
                query = "INSERT INTO EnergyManagerWidgets (UserID," + col + ",WidgetPlayerCode,SystemWidgetsID,Title) values (@userID,@dashboardId,@code,@id,@title)";
                var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("code", code.ToString()),
                    new SqlParameter("dashboardId", dashboardId),
                    new SqlParameter("title", title),
                    new SqlParameter("id", id)
                });
                query = "SELECT TOP 1 ID from EnergyManagerWidgets where UserID = @userID order by ID desc";
                dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>{
                    new SqlParameter("userID", new SessionHandler().UserID)
                }).Tables[0];

                return js.Serialize(new {
                    id = dt.Rows[0][0],
                    mode = "EditSystemWidget"
                });
            }
            if (type == "user") { 
                // if exists update else create new
                query = "SELECT TOP 1 ID FROM EnergyManagerWidgets where ID = @id AND UserID = @userID AND " + col + "=@dashboardId";
                dt = dbUtils.FillDataSetTable(query, "states", new List<SqlParameter>{
                    new SqlParameter("userID", new SessionHandler().UserID),
                    new SqlParameter("dashboardId", dashboardId),
                    new SqlParameter("id", id)
                }).Tables[0];
                if (dt.Rows.Count < 1)
                {
                    // create
                    query = "INSERT INTO EnergyManagerWidgets (UserID," + col + ",WidgetPlayerCode,Title) values (@userID,@dashboardId,@code,@title)";
                    var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                        new SqlParameter("userID", new SessionHandler().UserID),
                        new SqlParameter("dashboardId", dashboardId),
                        new SqlParameter("title", title),
                        new SqlParameter("code", code.ToString())
                    });
                    query = "SELECT TOP 1 ID from EnergyManagerWidgets where UserID = @userID order by ID desc";
                    dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>{
                        new SqlParameter("userID", new SessionHandler().UserID)
                    }).Tables[0];
                    return js.Serialize(new
                    {
                        id = dt.Rows[0][0],
                        mode = "Create"
                    });
                }
                else { 
                    // update
                    query = "UPDATE EnergyManagerWidgets set WidgetPlayerCode = @code, Title = @title where UserID = @userID and " + col + " = @dashboardId and ID = @id";
                    var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                        new SqlParameter("userID", new SessionHandler().UserID),
                        new SqlParameter("dashboardId", dashboardId),
                        new SqlParameter("id", id),
                        new SqlParameter("title", title),
                        new SqlParameter("code", code.ToString())
                    });
                    return js.Serialize(new
                    {
                        id = 1,
                        mode = "Update"
                    });
                }
            }
            return "";

        }

        [WebMethod]
        public static string resetDashboard(int id) {
            var query = "DELETE FROM EnergyManagerWidgets WHERE UserID = @userID and SystemDashboardsID = @id";
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            });
            query = "DELETE FROM EnergyManagerStates WHERE UserID = @userID and SystemDashboardsID = @id";
            a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            });
            return "1";
        }

        [WebMethod]
        public static string createDashboard(string title)
        {
            var query = "INSERT INTO EnergyManagerDashboards (UserID,Name) values (@userID,@title)";
            DataTable dt = new DataTable();
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("title", title)
            });
            query = "SELECT TOP 1 ID from EnergyManagerDashboards where UserID = @userID order by ID desc";
            dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID)
            }).Tables[0];
            return dt.Rows[0][0].ToString();
        }

        [WebMethod]
        public static string removeDashboard(int id)
        {
            var query = "DELETE FROM EnergyManagerDashboards WHERE UserID = @userID and ID = @id";
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            });
            query = "DELETE FROM EnergyManagerWidgets WHERE UserID = @userID and DashboardsID = @id";
            a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            });
            return "1";
        }

        [WebMethod]
        public static string updateDashboard(int id, string title)
        {
            var query = "UPDATE EnergyManagerDashboards SET Name = @title WHERE UserID = @userID and ID = @id";
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id),
                new SqlParameter("title", title)
            });
            return "1";
        }

        [WebMethod]
        public static string addWidget(string dashboardType, int dashboardId, string title)
        {
            var col = "";
            DataTable dt = new DataTable();
            if (dashboardType == "user") { col = "DashboardsID"; };
            if (dashboardType == "system") { col = "SystemDashboardsID"; };
            var query = "INSERT INTO EnergyManagerWidgets (UserID," + col + ",Title,WidgetPlayerCode) values (@userID,@dashboardId,@title,'')";
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("dashboardId", dashboardId),
                new SqlParameter("title", title)
            });
            query = "SELECT TOP 1 ID from EnergyManagerWidgets where UserID = @userID order by ID desc";
            dt = dbUtils.FillDataSetTable(query, "widgets", new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID)
            }).Tables[0];
            return dt.Rows[0][0].ToString();
        }

        [WebMethod]
        public static string deleteWidget(int id)
        {
            var query = "DELETE FROM EnergyManagerWidgets WHERE UserID = @userID and ID = @id";
            var a = dbUtils.ExecNonQuery(query, new List<SqlParameter>{
                new SqlParameter("userID", new SessionHandler().UserID),
                new SqlParameter("id", id)
            });
            return "1";
        }

        /* getBasicMeasurmentsFields, getBasicMeasurments, getMaxDemands, getDataLogsNums, getDataLogsFields, getDataLogs */

        private static UserBL GetCurrentUserObject()
        {
            SessionHandler sessionHandler = new SessionHandler();
            int userId = sessionHandler.UserID;
            UserBL userBL = new UserBL(userId);
            userBL.LoadUserDetails();
            return userBL;
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
