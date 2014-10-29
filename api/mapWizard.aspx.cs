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
