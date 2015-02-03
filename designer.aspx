<%@ Page Language="C#" AutoEventWireup="true" CodeFile="designer.aspx.cs" 
         Inherits="Satec.eXpertPowerPlus.Web.Designer" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head runat="server">

		<title>Satec Designer</title>

		<!--
			Dear Developer,
			please note - the designer can be extended and modified easily using modules.
			so any changes to the code within the 'system' folder should be cosidered.
			for more information about how the designer works, feel free to contact me (eldad)
		-->
		
		<script type="text/javascript" src="libs/jq.js"></script>
		<script type="text/javascript" src="libs/multisortable.js"></script>
		<script type="text/javascript" src="libs/helpers.js"></script>
		<script type="text/javascript" src="libs/spectrum.js"></script>
		<script type="text/javascript" src="libs/fileSaver.js"></script>
		<script type="text/javascript" src="libs/toBlob.js"></script>
		<script type="text/javascript" src="libs/parseColor.js"></script>
		<script type="text/javascript" src="libs/thumbnailer.js"></script>
		<script type="text/javascript" src="libs/popup.js"></script>
		<script type="text/javascript" src="libs/mustache.js"></script>
		<script type="text/javascript" src="libs/velocity.js"></script>

		<script type="text/javascript" src="../app_inc/Js/highcharts.js"></script>
		<script type="text/javascript" src="../app_inc/Js/highcharts-more.js"></script>
		<script type="text/javascript" src="../app_inc/Js/dl.js"></script>
		<script type="text/javascript" src="../app_inc/Js/widgetPlayer.js"></script>

		<script type="text/javascript" src="system/base.js"></script>
		<script type="text/javascript" src="system/init.js"></script>
		<script type="text/javascript" src="system/menu.js"></script>
		<script type="text/javascript" src="system/toolbar.js"></script>
		<script type="text/javascript" src="system/toolbox.js"></script>
		<script type="text/javascript" src="system/filters.js"></script>
		<script type="text/javascript" src="system/ui.js"></script>
		<script type="text/javascript" src="system/events.js"></script>
		<script type="text/javascript" src="system/render.js"></script>
		<script type="text/javascript" src="system/file.js"></script>
		<script type="text/javascript" src="system/history.js"></script>
		<script type="text/javascript" src="system/functions.js"></script>
		<script type="text/javascript" src="system/actions.js"></script>
		<script type="text/javascript" src="system/helpers.js"></script>

		<!-- <script type="text/javascript" src="designer.js"></script> -->

		<script type="text/javascript">

		$(document).ready(function()
		{

			setTimeout(function()
			{

				designer.init({
					name    : getString("UntitledProject"),
				    width   : 0,
					height  : 0,
					modules : ['<%=Request.QueryString["module"] %>'<% if(isAdmin) { %>,'<%=Request.QueryString["module"] %>Admin' <% } %>]
				});

			},20);

			<% if(isAdmin) { %>window.isAdmin = true;<% }else{%>window.isAdmin = false;<%} %>
			
		});

		</script>

		<link rel="stylesheet" type="text/css" href="css/spectrum.css">
		<link rel="stylesheet" type="text/css" href="css/designer.css">
		<link rel="stylesheet" type="text/css" href="css/popup.css">

	</head>
	<body class="<%=SessionHandler.Direction %>">

		<input type="file" id="files"  name="file"  class="uploadHandler" />
		<input type="file" id="images" name="image" class="uploadHandler" />

		<div class="mainMenu hidden"></div>

		<div class="toolbar box hidden">
			<div class="item"><%=Resources.Strings.Box %></div>
			<div class="sep"></div>
			<div class="item">X <input type="text" class="startX" /> &nbsp;Y <input type="text" class="startY" /></div>
			<div class="sep"></div>
			<div class="item">W <input type="text" class="width" /><span class="link"></span>H <input type="text" class="height" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Radius %> <input type="text" class="radius" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fill" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<!--<div class="sep"></div>
			<div class="item">
				<div class="left toolbarBigButton edit"><%=Resources.Strings.ChangeNOUN %></div>
				<div class="clear"></div>
			</div>-->
			<div class="clear"></div>
		</div>

		<div class="toolbar text hidden">
			<div class="item"><%=Resources.Strings.Text %></div>
			<div class="sep"></div>
			<div class="item">X <input type="text" class="startX" /> &nbsp;Y <input type="text" class="startY" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Font %> 
				<select class="font" data="string"></select> 
				&nbsp; <%=Resources.Strings.Size %> <input type="text" class="fontSize" value="30" /> &nbsp; <%=Resources.Strings.Bold %> <input type="checkbox" class="isBold"/> &nbsp; <%=Resources.Strings.Italic %> <input type="checkbox" class="isItalic"/></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fillStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar select hidden">
			<div class="item"><%=Resources.Strings.Select %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.ClickOrDragToSelect%></div>
			<div class="sep"></div>
			<div class="item"><input type="checkbox" id="selectGroup" />Select Group</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar selectMultiple hidden">
			<div class="item"><%=Resources.Strings.Select %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.MultipleSelected %></div>
			<div class="sep"></div>
			<div class="item">
				<div class="toolbarButton align alignRight"   type="Right"></div>
				<div class="toolbarButton align alignLeft"    type="Left"></div>
				<div class="toolbarButton align alignBottom"  type="Bottom"></div>
				<div class="toolbarButton align alignTop"     type="Top"></div>
				<div class="toolbarButton align alignMiddleV" type="MiddleV"></div>
				<div class="toolbarButton align alignMiddleH" type="MiddleH"></div>
				<div class="toolbarButton align alignCenter"  type="Center"></div>
			</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar move hidden">
			<div class="item"><%=Resources.Strings.Move %></div>
			<div class="sep"></div>
			<div class="item"><input type="checkbox" id="selectAndMove" /> <%=Resources.Strings.SelectAndMove %></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar ellipse hidden">
			<div class="item">Circle / Ellipse</div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fillStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item">
				<div class="left toolbarBigButton edit"><%=Resources.Strings.ChangeNOUN %></div>
				<div class="clear"></div>
			</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar line hidden">
			<div class="item">Line</div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item">
				<div class="left toolbarBigButton edit"><%=Resources.Strings.ChangeNOUN %></div>
				<div class="clear"></div>
			</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar path hidden">
			<div class="item">Path</div>
			<div class="sep"></div>
			<div class="shapes left hidden">
				<div class="item selectedShape"></div>
				<div class="listOfShapes hidden"></div>
				<div class="sep"></div>
				<div class="clear"></div>
			</div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fillStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item">
				<div class="left toolbarBigButton edit"><%=Resources.Strings.ChangeNOUN %></div>
				<div class="clear"></div>
			</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar transform hidden">
			<div class="item"><%=Resources.Strings.Transform %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.ClickToTransform%></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar eyedrop hidden">
			<div class="item"><%=Resources.Strings.Eyedropper %></div>
			<div class="sep"></div>
			<div class="item">Click on canvas to select color</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar fill hidden">
			<div class="item"><%=Resources.Strings.Fill %></div>
			<div class="sep"></div>
			<div class="item">Click on an object to apply fill</div>
			<div class="clear"></div>
		</div>

		<div class="stage">
			<canvas id="canvas"></canvas>
			<canvas id="gridCanvas"></canvas>
		</div>

		<div class="tools hidden">
			<div class="button select active" id="select" title="<%=Resources.Strings.Select %>"></div>
			<div class="button move" id="move" title="<%=Resources.Strings.Move %>"></div>
			<div class="sep"></div>
			<div class="button box" id="box" title="<%=Resources.Strings.Box %>"></div>
			<div class="button ellipse" id="ellipse" title="<%=Resources.Strings.CircleEllipse %>"></div>
			<div class="button line" id="line" title="<%=Resources.Strings.Line %>"></div>
			<div class="button path" id="path" title="<%=Resources.Strings.Path %>"></div>
			<div class="button image" id="image" title="<%=Resources.Strings.Image %>"></div>
			<div class="button text" id="text" title="<%=Resources.Strings.Text %>"></div>
			<div class="sep"></div>
			<!-- <div class="button transform"  id="transform"></div> -->
			<div class="button fill" id="fill" title="<%=Resources.Strings.Fill %>"></div>
			<div class="button eyedrop" id="eyedrop" title="<%=Resources.Strings.Eyedropper %>"></div>
			<div class="colors">
				<div class="color1Holder"><input class="color1 colorTool hidden" value="black" /></div>
				<div class="color2Holder"><input class="color2 colorTool hidden" value="white" /></div>
			</div>
		</div>

		<div class="sideBar"></div>

		<div class="clear"></div>

		<div id="resourcesData" class="hidden"></div>

		<!-- TEMPLATES -->
		<div id="ceTemplates" class="hidden">
			<!-- Resources toolbox item -->
			<div class="resourceItem dropItem">
				<div class="resourceName dropItem">{{name}}</div>
				<div class="resourceDisplay dropItem">
					<span class="helper"></span>
					<img class="resourceImage dropItem" />
				</div>
			</div>
		</div>

		<div class="hidden">
			<canvas id="helperCanvas"></canvas>
		</div>

		<!-- STRING RESOURCES (localization) -->
		<div id="stringResources" class="hidden">
			<string resource="HelloCanvas"     value="<%=Resources.Strings.HelloCanvas %>"></string>
			<string resource="NoResources"     value="<%=Resources.Strings.DragAddToProject %>"></string>
			<string resource="UntitledProject" value="<%=Resources.Strings.UntitledProject %>"></string>
			<string resource="NewProject"      value="<%=Resources.Strings.NewProject %>"></string>
			<string resource="Create"          value="<%=Resources.Strings.Create %>"></string>
			<string resource="Cancel"          value="<%=Resources.Strings.Cancel %>"></string>
			<string resource="ProjectName"     value="<%=Resources.Strings.ProjectName %>"></string>
			<string resource="CanvasSize"      value="<%=Resources.Strings.CanvasSize %>"></string>
			<string resource="FullScreen"      value="<%=Resources.Strings.FullScreen %>"></string>
			<string resource="file"            value="<%=Resources.Strings.File %>"></string>
			<string resource="new"             value="<%=Resources.Strings.New %>"></string>
			<string resource="save"            value="<%=Resources.Strings.SaveAs2 %>"></string>
			<string resource="saveAs"          value="<%=Resources.Strings.SaveAs2 %>"></string>
			<string resource="save2"           value="<%=Resources.Strings.Save %>"></string>
			<string resource="FileName"        value="<%=Resources.Strings.FileName %>"></string>
			<string resource="load"            value="<%=Resources.Strings.Load %>"></string>
			<string resource="importHtml"      value="<%=Resources.Strings.ImportHtml %>"></string>
			<string resource="exportHtml"      value="<%=Resources.Strings.ExportHtml %>"></string>
			<string resource="exportSvg"       value="<%=Resources.Strings.ExportSvg %>"></string>
			<string resource="exportPng"       value="<%=Resources.Strings.ExportPng %>"></string>
			<string resource="exportJpg"       value="<%=Resources.Strings.ExportJpg %>"></string>
			<string resource="edit"            value="<%=Resources.Strings.Edit2 %>"></string>
			<string resource="undo"            value="<%=Resources.Strings.Undo %>"></string>
			<string resource="redo"            value="<%=Resources.Strings.Redo %>"></string>
			<string resource="copy"            value="<%=Resources.Strings.Copy %>"></string>
			<string resource="paste"           value="<%=Resources.Strings.Paste %>"></string>
			<string resource="selectAll"       value="<%=Resources.Strings.SelectAll %>"></string>
			<string resource="delete"          value="<%=Resources.Strings.Delete %>"></string>
			<string resource="bringToFront"    value="<%=Resources.Strings.BringToFront %>"></string>
			<string resource="sendToBack"      value="<%=Resources.Strings.SendToBack %>"></string>
			<string resource="view"            value="<%=Resources.Strings.View %>"></string>
			<string resource="grid"            value="<%=Resources.Strings.Grid2 %>"></string>
			<string resource="objects"         value="<%=Resources.Strings.Objects %>"></string>
			<string resource="resources"       value="<%=Resources.Strings.Resources %>"></string>
			<string resource="visible"         value="<%=Resources.Strings.Visible %>"></string>
			<string resource="snap"            value="<%=Resources.Strings.Snap %>"></string>
			<string resource="size"            value="<%=Resources.Strings.Size %>"></string>
			<string resource="lineWidth"       value="<%=Resources.Strings.LineWidth %>"></string>
			<string resource="style"           value="<%=Resources.Strings.Style %>"></string>
			<string resource="text"            value="<%=Resources.Strings.Text %>"></string>
			<string resource="transform"       value="<%=Resources.Strings.Transform %>"></string>
			<string resource="rotate"          value="<%=Resources.Strings.Rotate %>"></string>
			<string resource="shadow"          value="<%=Resources.Strings.Shadow %>"></string>
			<string resource="fx"              value="FX"></string>
			<string resource="color"           value="<%=Resources.Strings.Color %>"></string>
			<string resource="blur"            value="<%=Resources.Strings.Blur %>"></string>
			<string resource="offsetX"         value="<%=Resources.Strings.Offset %> X"></string>
			<string resource="offsetY"         value="<%=Resources.Strings.Offset %> Y"></string>
			<string resource="Scale"           value="<%=Resources.Strings.Scale %>"></string>
			<string resource="Eyedropper"      value="<%=Resources.Strings.Eyedropper %>"></string>
			<string resource="flattenImg"      value="<%=Resources.Strings.FlattenImage %>"></string>
			<string resource="flattenSel"      value="<%=Resources.Strings.FlattenSelecteds %>"></string>
			<string resource="group"           value="<%=Resources.Strings.GroupNoun %>"></string> 
			<string resource="groupTitle"      value="<%=Resources.Strings.Group %>"></string>
			<string resource="ungroup"         value="<%=Resources.Strings.Ungroup %>"></string>
			<string resource="image"           value="<%=Resources.Strings.Image %>"></string>
			<string resource="brightCont"      value="<%=Resources.Strings.BrightnessContrast %>"></string>
			<string resource="hueSat"          value="<%=Resources.Strings.HueSaturation %>"></string>
			<string resource="hue"             value="<%=Resources.Strings.Hue %>"></string>
			<string resource="saturation"      value="<%=Resources.Strings.Saturation %>"></string>
			<string resource="lightness"       value="<%=Resources.Strings.Lightness %>"></string>
			<string resource="colorize"        value="<%=Resources.Strings.Colorize %>"></string>
			<string resource="red"             value="<%=Resources.Strings.Red %>"></string>
			<string resource="green"           value="<%=Resources.Strings.Green %>"></string>
			<string resource="blue"            value="<%=Resources.Strings.Blue %>"></string>
			<string resource="greyscale"       value="<%=Resources.Strings.Greyscale %>"></string>
			<string resource="sharpen"         value="<%=Resources.Strings.Sharpen %>"></string>
			<string resource="blur"            value="<%=Resources.Strings.Blur %>"></string>
			<string resource="brightness"      value="<%=Resources.Strings.Brightness %>"></string>
			<string resource="contrast"        value="<%=Resources.Strings.Contrast %>"></string>

			<!-- Template Editor -->
			<string resource="LoadingTemplates" value="<%=Resources.Strings.LoadingTemplates %>"></string>
			<string resource="dynamicField"     value="<%=Resources.Strings.Field %>"></string>
			<string resource="templates"        value="<%=Resources.Strings.Templates %>"></string>
			<string resource="header"           value="<%=Resources.Strings.TopHeader %>"></string>
			<string resource="footer"           value="<%=Resources.Strings.Footer %>"></string>
			<string resource="title"            value="<%=Resources.Strings.Title %>"></string>
			<string resource="type"             value="<%=Resources.Strings.Type %>"></string>
			<string resource="active"           value="<%=Resources.Strings.Active %>"></string>
			<string resource="unsavedData"      value="<%=Resources.Strings.UnsavedDataWillbeLostDoYouWantToContinue %>"></string>
			<string resource="CreateATemplate"  value="<%=Resources.Strings.CreateATemplate %>"></string>
			<string resource="SelectADesign"    value="<%=Resources.Strings.SelectADesign %>"></string>
			<string resource="FirstTimeUsing"   value="<%=Resources.Strings.FirstTimeUsing %>"></string>
			<string resource="Height"           value="<%=Resources.Strings.Height %>"></string>
			<string resource="Width"            value="<%=Resources.Strings.Width %>"></string>
			<string resource="Continue"         value="<%=Resources.Strings.Continue2 %>"></string>
			<string resource="TemplateName"     value="<%=Resources.Strings.TemplateName %>"></string>
			<string resource="UntitledTemplate" value="<%=Resources.Strings.UntitledTemplate %>"></string>
			<string resource="Customizable"     value="<%=Resources.Strings.Customizable %>"></string>	
			<string resource="Back"             value="<%=Resources.Strings.Back %>"></string>
			<string resource="AreYouSure"       value="<%=Resources.Strings.AreYouSure %>"></string>
			<string resource="DeleteTemplate"   value="<%=Resources.Strings.AreYouSureDeleteTemplate %>"></string>
			<string resource="Loading"   		value="<%=Resources.Strings.Loading %>"></string>
			<string resource="Saving"   		value="<%=Resources.Strings.Saving %>"></string>
			<string resource="SuccessfullySaved"value="<%=Resources.Strings.SuccessfullySaved %>"></string>
			<string resource="Close"            value="<%=Resources.Strings.Close %>"></string>
			<string resource="Preview"          value="<%=Resources.Strings.Preview %>"></string>
			<string resource="MakeStaticText"   value="<%=Resources.Strings.MakeStaticText %>"></string>
			<string resource="MakeDynamicData"  value="<%=Resources.Strings.MakeDynamicData %>"></string>
			<string resource="MakeGlobalized"   value="<%=Resources.Strings.MakeGlobalized %>"></string>
			<string resource="GlobalText"       value="<%=Resources.Strings.GlobalText %>"></string>
			<string resource="DynamicData"      value="<%=Resources.Strings.DynamicData %>"></string>
			<string resource="ChooseLanguage"   value="<%=Resources.Strings.ChooseLanguage %>"></string>

			<!-- Map Wizard -->
			<string resource="Create"           value="<%=Resources.Strings.Create %>"></string>
			<string resource="MapWizard"        value="<%=Resources.Strings.MapWizard %>"></string>
			<string resource="CreateNewMap"     value="<%=Resources.Strings.CreateNewMap %>"></string>
			<string resource="LoadMap"          value="<%=Resources.Strings.LoadMap %>"></string>
			<string resource="Title"            value="<%=Resources.Strings.Title %>"></string>
			<string resource="Customize"        value="<%=Resources.Strings.Customize %>"></string>
			<string resource="FullScreen"       value="<%=Resources.Strings.FullScreen %>"></string>
			<string resource="Submit"           value="<%=Resources.Strings.Submit %>"></string>
			<string resource="Start"            value="<%=Resources.Strings.Start %>"></string>
			<string resource="EnterTitle"       value="<%=Resources.Strings.EnterTitle %>"></string>
			<string resource="TitleTooShort"    value="<%=Resources.Strings.TitleTooShort %>"></string>
			<string resource="MapNameExists"    value="<%=Resources.Strings.MapNameExists %>"></string>
			<string resource="SelectMapTIt"     value="<%=Resources.Strings.SelectMapTIt %>"></string>
			<string resource="SelectParameter"  value="<%=Resources.Strings.SelectParameter %>"></string>
			<string resource="MakeButton"       value="<%=Resources.Strings.MakeButton %>"></string>
			<string resource="LinkToUrl"        value="<%=Resources.Strings.LinkToUrl %>"></string>
			<string resource="LinkToMap"        value="<%=Resources.Strings.LinkToMap %>"></string>
			<string resource="LinkToPage"       value="<%=Resources.Strings.LinkToPage %>"></string>
			<string resource="LastReading"      value="<%=Resources.Strings.LastReading %>"></string>
			<string resource="TOUImport"        value="<%=Resources.Strings.TOUImport %>"></string>
			<string resource="EnterDeviceID"    value="<%=Resources.Strings.EnterDeviceID %>"></string>
			<string resource="SelectUrl"        value="<%=Resources.Strings.SelectUrl %>"></string>
			<string resource="SelectDevice"     value="<%=Resources.Strings.SelectDevice %>"></string>
			<string resource="Basic"            value="<%=Resources.Strings.Basic %>"></string>
			<string resource="Energy"           value="<%=Resources.Strings.Energy %>"></string>
			<string resource="Type"             value="<%=Resources.Strings.Type %>"></string>
			<string resource="Parameter"        value="<%=Resources.Strings.Parameter %>"></string>
			<string resource="Exit"             value="<%=Resources.Strings.Exit %>"></string>
			<string resource="MakeChart"        value="<%=Resources.Strings.MakeChart %>"></string>
			<string resource="BasicMeasuremnts" value="<%=Resources.Strings.BasicMeasuremnts %>"></string>
			<string resource="Readings" 		value="<%=Resources.Strings.Readings %>"></string>
			<string resource="DataLogs" 		value="<%=Resources.Strings.DataLogs %>"></string>
			<string resource="MaxDemands" 		value="<%=Resources.Strings.MaxDemands %>"></string>
			<string resource="DataType" 		value="<%=Resources.Strings.DataType %>"></string>
			<string resource="Past24Hours" 		value="<%=Resources.Strings.Past24Hours %>"></string>
			<string resource="PastWeek" 		value="<%=Resources.Strings.PastWeek %>"></string>
			<string resource="PastMonth" 		value="<%=Resources.Strings.PastMonth %>"></string>
			<string resource="Past6Months" 		value="<%=Resources.Strings.Past6Months %>"></string>
			<string resource="PastYear" 		value="<%=Resources.Strings.PastYear %>"></string>
			<string resource="SelectDates" 		value="<%=Resources.Strings.SelectDates %>"></string>
			<string resource="Days" 			value="<%=Resources.Strings.Days %>"></string>
			<string resource="Weeks" 			value="<%=Resources.Strings.Weeks %>"></string>
			<string resource="Months" 			value="<%=Resources.Strings.Months %>"></string>
			<string resource="Resolution" 		value="<%=Resources.Strings.Resolution %>"></string>
			<string resource="DateRange" 		value="<%=Resources.Strings.DateRange %>"></string>
			<string resource="NoDataToDisplay"  value="<%=Resources.Strings.NoDataToDisplay %>"></string>
			<string resource="Consumption"      value="<%=Resources.Strings.Consumption %>"></string>
			<string resource="Cost"             value="<%=Resources.Strings.Cost %>"></string>
			<string resource="kWhImport"        value="<%=Resources.Strings.kWhImport %>"></string>
			<string resource="Reading"          value="<%=Resources.Strings.Reading %>"></string>
			<string resource="kvarh"            value="<%=Resources.Strings.kvarh %>"></string>
			<string resource="kWh"              value="<%=Resources.Strings.kWh %>"></string>
			<string resource="PowerFactor"      value="<%=Resources.Strings.PowerFactor %>"></string>
			<string resource="MaxDemand"        value="<%=Resources.Strings.MaxDemand %>"></string>
			<string resource="kVA"              value="<%=Resources.Strings.kVA %>"></string>
			<string resource="kW"               value="<%=Resources.Strings.kW %>"></string>
			<string resource="Minutes"          value="<%=Resources.Strings.Minutes %>"></string>
			<string resource="Hours"            value="<%=Resources.Strings.Hours %>"></string>
			<string resource="Button"           value="<%=Resources.Strings.Button %>"></string>
			<string resource="ResourcesDevices" value="<%=Resources.Strings.ResourcesDevices %>"></string>
			<string resource="Symbols"          value="<%=Resources.Strings.Symbols %>"></string>
			<string resource="ParamBox"         value="<%=Resources.Strings.ParamBox %>"></string>
			
		</div>

	</body>
</html>