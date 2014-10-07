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
    public partial class Designer : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler;
        public bool isAdmin = false;
        //public string Module;

        protected void Page_Load(object sender, EventArgs e)
        {
            //Module = Request.Querystring["module"];
            SessionHandler sessionHandler = new SessionHandler();
            if (sessionHandler.UserID == 4010 && sessionHandler.UserName == "eldadl") isAdmin = true;
        }
    }
}
