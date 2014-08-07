using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.Services;
using Satec.eXpertPowerPlus.BL.Maps;
using Satec.eXpertPowerPlus.BL;
using Satec.UtilsBL.xpwUtilities;
using Satec.eXpertPower.Utilities;

namespace Satec.eXpertPowerPlus.Web
{
    public partial class CircuitEditor : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler;

        protected void Page_Load(object sender, EventArgs e)
        {
            SessionHandler sessionHandler = new SessionHandler();
        }

        [WebMethod]
        public static object init()
        {
            SessionHandler sessionHandler = new SessionHandler();
            var obj = new{ init = true };
            return obj;
        }
    }
}
