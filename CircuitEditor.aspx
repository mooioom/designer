<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CircuitEditor.aspx.cs" 
         Inherits="Satec.eXpertPowerPlus.Web.CircuitEditor" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head runat="server">

		<title></title>
		
		<script type="text/javascript" src="libs/jq.js"></script>
		<script type="text/javascript" src="libs/multisortable.js"></script>
		<script type="text/javascript" src="libs/helpers.js"></script>
		<script type="text/javascript" src="libs/spectrum.js"></script>
		<script type="text/javascript" src="libs/fileSaver.js"></script>
		<script type="text/javascript" src="libs/toBlob.js"></script>
		<script type="text/javascript" src="libs/parseColor.js"></script>
		<script type="text/javascript" src="libs/thumbnailer.js"></script>
		<script type="text/javascript" src="libs/popup.js"></script>

		<script type="text/javascript" src="system/base.js"></script>
		<script type="text/javascript" src="system/init.js"></script>
		<script type="text/javascript" src="system/menu.js"></script>
		<script type="text/javascript" src="system/toolbar.js"></script>
		<script type="text/javascript" src="system/toolbox.js"></script>
		<script type="text/javascript" src="system/events.js"></script>
		<script type="text/javascript" src="system/render.js"></script>
		<script type="text/javascript" src="system/file.js"></script>
		<script type="text/javascript" src="system/history.js"></script>
		<script type="text/javascript" src="system/functions.js"></script>
		<script type="text/javascript" src="system/actions.js"></script>
		<script type="text/javascript" src="system/helpers.js"></script>

		<script type="text/javascript" src="CircuitEditor.js"></script>

		<link rel="stylesheet" type="text/css" href="css/spectrum.css">
		<link rel="stylesheet" type="text/css" href="css/CircuitEditor.css">
		<link rel="stylesheet" type="text/css" href="css/popup.css">

	</head>
	<body class="<%=SessionHandler.Direction %>">

		<input type="file" id="files" name="file" />

		<div class="mainMenu"></div>

		<div class="toolbar box">
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
			
			<!-- <div class="sep"></div>
			<div class="item"><div class="smallButton" id="boxCreate">Create</div></div> -->
			<div class="clear"></div>
		</div>

		<div class="toolbar text hidden">
			<div class="item"><%=Resources.Strings.Text %></div>
			<div class="sep"></div>
			<div class="item">X <input type="text" class="startX" /> &nbsp;Y <input type="text" class="startY" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Font %> 
				<select class="font" data="string">
					<option value="arial">Arial</option>
					<option value="arial black">Arial Black</option>
					<option value="comic sans ms">Comic Sans Ms</option>
					<option value="courier">Courier</option>
					<option value="cursive">Cursive</option>
					<option value="fantasy">Fantasy</option>
					<option value="georgia">Georgia</option>
					<option value="helvetica">Helvetica</option>
					<option value="impact">Impact</option>
					<option value="lucida console">Lucida Console</option>
					<option value="marlett">Marlett - Symbols</option>
					<option value="mekanik let">Mekanik Let</option>
					<option value="monospace">Monospace</option>
					<option value="sans-serif">Sans Serif</option>
					<option value="symbol">Symbol</option>
					<option value="tahoma">Tahoma</option>
					<option value="times new roman">Times New Roman</option>
					<option value="trebuchet ms">Trebuchet ms</option>
					<option value="verdana">Verdana</option>
					<option value="webdings">Webdings</option>
					<option value="wingdings">Wingdings</option>
				</select> &nbsp; <%=Resources.Strings.Size %> <input type="text" class="fontSize" value="30" /> &nbsp; <%=Resources.Strings.Bold %> <input type="checkbox" class="isBold"/> &nbsp; <%=Resources.Strings.Italic %> <input type="checkbox" class="isItalic"/></div>
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

		<div class="toolbar transform hidden">
			<div class="item"><%=Resources.Strings.Transform %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.ClickToTransform%></div>
			<div class="clear"></div>
		</div>

		<div class="stage">
			<canvas id="canvas"></canvas>
			<canvas id="gridCanvas"></canvas>
		</div>

		<div class="toolbox grid hidden">
			<div class="header"><%=Resources.Strings.Grid2 %></div>
			<div class="close">X</div>
			<div class="body">
				<div class="item"><input type="checkbox" id="visible" checked="checked" /> <%=Resources.Strings.Visible %></div>
				<div class="item"><input type="checkbox" id="snap" checked="checked" /> <%=Resources.Strings.Snap %> </div>
				<div class="item"><input type="text" id="size" value="14"  /> <%=Resources.Strings.Size %> </div>
				<div class="item"><input type="text" id="lineWidth" value="0.1"  /> <%=Resources.Strings.LineWidth %> </div>
				<div class="item"><input type="text" id="strokeStyle" value="#000"  /> <%=Resources.Strings.Style %> </div>
			</div>
		</div>

		<div class="toolbox text hidden">
			<div class="header"><%=Resources.Strings.Text %></div>
			<div class="close">X</div>
			<div class="body">
				<div class="item"><textarea id="text"></textarea></div>
			</div>
		</div>

		<div class="toolbox objects">
			<div class="header"><%=Resources.Strings.Objects %></div>
			<div class="close">X</div>
			<div class="body sortable"></div>
			<div class="toolboxMenu">
				<div class="toolboxMenuItem left shadow disabled"><%=Resources.Strings.Shadow %></div>
				<div class="toolboxMenuItem left transform disabled"><%=Resources.Strings.Transform %></div>
				<div class="toolboxMenuItem left fx disabled">Fx</div>
				<div class="toolboxMenuItem right add">+</div>
				<div class="toolboxMenuItem right delete disabled"></div>
				<div class="clear"></div>
			</div>
		</div>

		<div class="toolbox resources">
			<div class="header"><%=Resources.Strings.Resources %></div>
			<div class="close">X</div>
			<div class="body"></div>
			<div class="toolboxMenu">
				<div class="toolboxMenuItem right delete disabled"></div>
				<div class="clear"></div>
			</div>
		</div>

		<div class="toolbox shadow hidden">
			<div class="header"><%=Resources.Strings.Shadow %></div>
			<div class="close">X</div>
			<div class="body">
				<div class="item"><%=Resources.Strings.Color %> <input type="text" class="shadowColor"></div>
				<div class="item"><%=Resources.Strings.Blur %><br/><input type="range" class="shadowBlur" min="0" max="20" step="0.1" value="0"></div>
				<div class="item"><%=Resources.Strings.Offset %> X<br/><input type="range" class="shadowOffsetX" min="-20" max="20" step="0.1" value="0"></div>
				<div class="item"><%=Resources.Strings.Offset %> Y<br/><input type="range" class="shadowOffsetY" min="-20" max="20" step="0.1" value="0"></div>
			</div>
		</div>

		<div class="toolbox transform hidden">
			<div class="header"><%=Resources.Strings.Transform %></div>
			<div class="close">X</div>
			<div class="body">
				<div class="item">
					  <div class="title"><%=Resources.Strings.Rotate %></div>
					  <input type="range" class="rotate" min="0" max="360" step="5" value="0">
				</div>
			</div>
		</div>

		<div class="toolbox fx hidden">
			<div class="header">FX</div>
			<div class="close">X</div>
			<div class="body"></div>
		</div>

		<div class="tools">
			<div class="button select"     id="select"></div>
			<div class="button move"       id="move"></div>
			<!-- <div class="button transform"  id="transform"></div> -->
			<div class="button box active" id="box"></div>
			<div class="button text"       id="text"></div>
		</div>
		
		<div class="debugger hidden">
			<span id="x">0</span>, <span id="y">0</span><br />
			mouseDown : <span id="mouseDown">off</span><br/ >
			drag : <span id="drag">off</span><br/>
			objects : <br />
			<span id="objects"></span><br/>
			action : <span id="action">box</span><br />
			selected : <span id="selected"></span><br />
			movedX : <span id="movedX">0</span><br/>
			movedY : <span id="movedY">0</span><br/>
		</div>

		<div class="clear"></div>

		<div id="resourcesData" class="hidden"></div>

		<!-- TEMPLATES -->
		<div id="ceTemplates" class="hidden">
			<!-- Resources toolbox item -->
			<div class="resourceItem dropItem">
				<div class="left resourceDisplay dropItem"><span class="helper"></span><img class="resourceImage dropItem" /></div>
				<div class="left resourceName dropItem"></div>
				<div class="clear"></div>
			</div>
			<!-- Objects toolbox item -->
			<div class="objectsItem">
				<!--<div class="left objectDisplay"><canvas class="objectCanvas"></canvas></div>-->
				<div class="left objectName"><%=Resources.Strings.Object %> 0</div>
				<div class="right objectLock unlocked"></div>
				<div class="right objectVisible"></div>
				<div class="clear"></div>
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
			<string resource="load"            value="<%=Resources.Strings.Load %>"></string>
			<string resource="exportSvg"       value="<%=Resources.Strings.ExportSvg %>"></string>
			<string resource="exportPng"       value="<%=Resources.Strings.ExportPng %>"></string>
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
		</div>

	</body>
</html>