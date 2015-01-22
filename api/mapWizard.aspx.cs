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
            List<Dictionary<string, object>> r = formatDataTable(data);
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
