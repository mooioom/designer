//@ sourceURL=templateEditor.js

console.log('templateEditor',editor);

templateEditor = {

	id        : 0,
	type      : "",
	isAudited : 0,

	init : function(){

		this.id        = Number(getParams().id);
		this.type      = getParams().type;
		this.isAudited = getParams().audited;

		this.getData();
		this.render();
		this.events();
		this.load();

		$('#new,#save,#load').hide();

	},

	getData : function(){

		//todo :: get available dynamic fields from server
		this.dynamicFields = [
			{ label : 'Computation Number',       value : 'computationNumber' },
			{ label : 'Client Address',  		  value : 'clientAddress' },
			{ label : 'Device Name', 			  value : 'deviceName' },
			{ label : 'Site Name',  			  value : 'siteName' },
			{ label : 'Meter Number',             value : 'meterNumber' },
			{ label : 'Billing Month',            value : 'billingMonth' },
			{ label : 'Number of days in period', value : 'noDaysInPeriod' },
			{ label : 'Metering Period - From',   value : 'meteringPeriodFrom' },
			{ label : 'Metering Period - To',     value : 'meteringPeriodTo' },
			{ label : 'Invoice Date',             value : 'invoiceDate' },
			{ label : 'Method of Charge',         value : 'methodOfCharge' }
		]

	},

	render : function(){

		$('.toolbar.text .clear').remove();
		$('.toolbar.text').append('<div class="sep dynamicInput hidden"></div>');
		$('.toolbar.text').append('<div class="item dynamicInput hidden"><div class="left">Dynamic Data : <select id="dynamicFields"></select></div><div class="left"><div class="toolbarButtonB removeDynamicData">Make Static Text</div></div><div class="clear"></div></div>');
		$('.toolbar.text').append('<div class="sep chooseDataType hidden"></div>');
		$('.toolbar.text').append('<div class="item chooseDataType hidden"><div class="toolbarButtonB left dynamicData">Make Dynamic Data</div><div class="toolbarButtonB left globalizedStringButton">Make Globalized String</div><div class="clear"></div></div>');
		$('.toolbar.text').append('<div class="sep globalizedString hidden"></div>');
		$('.toolbar.text').append('<div class="item globalizedString hidden"><div class="left globalHolder">Global Text : <input type="text" id="globalizedString" /><div id="globalizedStringChooser" class="hidden"></div></div><div class="left globalizedGlobe disabled"></div><div class="left"><div class="toolbarButtonB removeDynamicData">Make Static Text</div></div><div class="clear"></div></div>');
		$('.toolbar.text').append('<div class="clear"></div>');

		$('.toolbarButtonB').before('<div class="left textAlignButtons"><div class="textAlignButton selected textAlignLeft" textAlign="left"></div><div class="textAlignButton textAlignCenter" textAlign="center"></div><div class="textAlignButton textAlignRight" textAlign="right"></div><div class="clear"></div></div>');

		for(i in this.dynamicFields){

			field = this.dynamicFields[i];
			$('#dynamicFields').append('<option value="'+field.value+'">'+field.label+'</option>');

		}

	},

	events : function(){

		$('.closeDesigner').click(function(){
			window.parent.$('html').css('height','initial').css('overflow','initial');
			window.parent.closeDesigner();
		});

		$('.saveTemplate').click($.proxy(this.save,this));

		$(window).resize( templateEditor.reposition );

		$('#dynamicFields').change(function(){

			if(editor.selecteds.length) editor.selecteds[0].dynamic = $(this).val();

		});

		$('.removeDynamicData').click(function(){
			if(editor.selecteds.length) {
				if(editor.selecteds[0].dynamic) delete editor.selecteds[0].dynamic;
				if(editor.selecteds[0].globalized) delete editor.selecteds[0].globalized;
				$('.chooseDataType').show();
				$('.dynamicInput').hide();
				$('.globalizedString').hide();
			}
		});

		$('#globalizedString').keyup(function(){

			$('#globalizedStringChooser').empty().hide();
			$('.globalizedGlobe').addClass('disabled');

			var q = $(this).val();

			$.ajax({
				type        : "POST",
				contentType : "application/json; charset=utf-8",
				data        : JSON.stringify({q:q}),
				url         : "../../Login/OpenWebMethods.aspx/StringTexts",
				dataType    : "json",
				success     : function( data )
				{
					if(data.d && data.d.length){
						$('#globalizedStringChooser').show();
						var strings = data.d;
						for(i in strings)
						{
							var string = strings[i];
							if(string.label == '' || string.label == ' ') continue;
							$('#globalizedStringChooser').append('<div stringid="'+string.id+'" class="chooserItem">'+string.label+'</div>');
						}
					}
					else $('#globalizedStringChooser').hide();
				}
			});

		});

		$('.textAlignButton').click(function(){
			$('.textAlignButton').removeClass('selected');
			$(this).addClass('selected');
			editor.selecteds[0].textAlign = $(this).attr('textAlign');
		});

		$(document).on('click', '#globalizedStringChooser .chooserItem', $.proxy(function( e ){

			var item = $(e.target),
				id   = Number(item.attr('stringid')),
				text = item.html();

			$('#globalizedString').val(text);
			$('.globalizedGlobe').removeClass('disabled');

			editor.selecteds[0].globalized = {
				id   : id,
				text : text
			};

			$('#globalizedStringChooser').empty().hide();

		},this));

		$('.globalizedGlobe').click($.proxy(function(){

			this.api('StringsByIDLang',function( data ){
				if(data.d && data.d.length){
					langs = JSON.parse(data.d);
					var divs = $('<div class="langs"></div>');
					for(i in langs){
						lang = langs[i];
						if(!lang.Lang) lang.Lang = lang.Description;
						divs.append('<div class="lang"><div class="left langTitle">'+lang.Lang+'</div><div class="left langText">'+lang.Text+'</div><div class="clear"></div></div>');
					}
					langPop = new Popup({
						header  : 'Variations of ' + editor.selecteds[0].globalized.text,
						content : divs.html(),
						closeText : 'Close'
					})
				}
			},{id  : editor.selecteds[0].globalized.id})

		},this));

		editor.onSelect = function(){
			//console.log('onSelect');
		}

		editor.onToolChange = function(){
			if(editor.action == 'text') $('.chooseDataType, .dynamicInput, .globalizedString').hide();
			else editor.onMouseUp();
		}

		editor.onMouseUp = function(){
			$('.chooseDataType, .dynamicInput, .globalizedString').hide();
			if( editor.helpers.selectedIsText() )
			{
				text = editor.selecteds[0];
				if(text.dynamic){
					$('.dynamicInput').show();
					$('#dynamicFields').val(text.dynamic);
					$('.textAlignButton').removeClass('selected');
					$('.textAlignButton[textAlign="'+text.textAlign+'"]').addClass('selected');
				}
				else if(text.globalized){
					$('.globalizedString').show();
					$('#globalizedString').val(text.globalized.text);
					$('.globalizedGlobe').removeClass('disabled');
					$('.textAlignButton').removeClass('selected');
					$('.textAlignButton[textAlign="'+text.textAlign+'"]').addClass('selected');
				}
				else $('.chooseDataType').show();
			}
		}

		$('.dynamicData').click(function(){
			$('.chooseDataType').hide();

			editor.selecteds[0].textAlign = 'left';
			$('.textAlignButton').removeClass('selected');
			$('.textAlignButton[textAlign="left"]').addClass('selected');

			$('.dynamicInput').show();
		});

		$('.globalizedStringButton').click(function(){
			$('.chooseDataType').hide();

			editor.selecteds[0].textAlign = 'left';
			$('.textAlignButton').removeClass('selected');
			$('.textAlignButton[textAlign="left"]').addClass('selected');
			$('#globalizedString').val('');
			$('.globalizedGlobe').addClass('disabled');
			$('.globalizedString').show();
		});

		$('.previewHtml').click($.proxy(function(){ this.preview(); },this));

		$(document).on('change','#previewLang',$.proxy(this.previewAction,this));

	},

	api : function( action, callback, data ){

		a = {
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/"+action,
			dataType    : "json",
			success     : $.proxy(callback,this)
		}

		if(data) a.data = JSON.stringify(data);

		$.ajax(a);

	},

	preview : function(){

		this.api('getPreviewData',$.proxy(function( data ){

			data = $.parseJSON(data.d);

			previewContent    = $('<div class="previewContent"></div>');
			previewHtml       = $('<div class="htmlPreviewData previewMode" style="width:'+$('#canvas').width()+'px; height:'+$('#canvas').height()+'px"></div>');

			previewMenu       = $('<div class="htmlPreviewMenu"></div>');
			previewLang       = $('<div class="left previewLang">Choose Language : </div>');
			previewLangSelect = $('<select id="previewLang"></select>');
			clearer           = $('<div class="clear"></div>');

			for(i in data.previewData) {
				var lang = data.previewData[i], selected = '';
				if(lang.ID == data.langId) selected = 'selected="selected"';
				previewLangSelect.append('<option value="'+lang.ID+'" '+selected+'>'+lang.Text+'</option>');
			}

			previewLang.append(previewLangSelect);
			previewMenu.append(previewLang);
			previewMenu.append(clearer);

			previewContent.append(previewMenu);
			previewContent.append(previewHtml);

			htmlPopup = new Popup({
				header    : "Preview...",
				closeText : "Close",
				content   : previewContent,
				addClass  : 'htmlPreview',
				onLoad    : function(){ $('#previewLang').trigger('change'); }
			});

		},this),{});

	},

	previewAction : function( e ){

		$('.htmlPreviewData').addClass('previewMode')
							 .html('<div class="loadingPreview" style="line-height:' + $('#canvas').height() + 'px">Generating Preview...</div>')

		var item    = $(e.target),
			objects = $.extend(true,{},editor.objects);

		html = editor.file.getHtml( { objects : this.transformObjects(objects) } );

		this.api('getHtml',function(data){
			$('.htmlPreviewData').removeClass('previewMode');
			data = $.parseJSON(data.d);
			$('.htmlPreviewData').html(data.html);
		},{
			langId : Number(item.val()),
			html   : html
		});

	},

	load : function( id ){

		this.api('getTemplate',$.proxy(function( data ){

			data     = $.parseJSON(data.d);
			template = data[0];

			editor.reset();
			editor.init({
				name    : template.Name,
			    width   : 1024,
				height  : Number(template.Height),
				data    : template.Data
			});

			this.reposition();

		}),{
			id 		  : this.id,
			type 	  : this.type,
			isAudited : this.isAudited
		})

	},

	save : function(){

		height = $('#canvas').height();

		editor.ui.indicator.show( getString('Saving')+'...' );
		objects = $.extend(true,{},editor.objects);

		this.api(
			'saveTemplate',
			$.proxy(function( data ){
				if(data) {
					editor.ui.indicator.hide();
					editor.ui.indicator.show( getString('SuccessfullySaved')+'!' );
					editor.ui.indicator.hide();
					window.parent.invoiceLayout.refreshCurrent(this.type, this.id, true);
					$('.closeDesigner').trigger('click');
				}
			},this),
			{ id : this.id, type : this.type, height : height, data : editor.file.getData(), html : editor.file.getHtml( { objects:this.transformObjects(objects) } ) }
		)
	},

	transformObjects : function(objects)
	{

		for(i in objects)
		{

			o = objects[i];

			var absCoords = editor.helpers.getAbsCoords(o.startX,o.startY,o.width,o.height),
				x = absCoords.x,y = absCoords.y,w = absCoords.w,h = absCoords.h,cx = x + (w/2),cy = y + (h/2),
				sx = o.shadowOffsetX, sy = o.shadowOffsetY, sb = o.shadowBlur, sc = o.shadowColor;

			if(!sx) sx = '0'; if(!sy) sy = '0'; if(!sb) sb = '0'; if(!sc) sc = 'rgba(0,0,0,1)';

			color       = $.parseColor(sc);
			colorString = "rgb("+color[0]+","+color[1]+","+color[2]+")";
			opacity     = color[3];

			if(!o.shadowOffsetX) o.shadowOffsetX = 0;
			if(!o.shadowOffsetY) o.shadowOffsetY = 0;
			if(!o.shadowBlur)    o.shadowBlur    = 0;

			if(o.dynamic || o.globalized)
			{
				if(o.dynamic)    o.text = '<dyn id="'+o.dynamic+'" />';
				if(o.globalized) o.text = '<glb id="'+o.globalized.id+'" />';

				if(o.textAlign != 'center') continue;

				o.addToExportStyle = 'width : 0px; text-align : '+o.textAlign;

				if(!o.fill) fill = "#000"; else fill = o.fill;
				var str = '<div style="';
					str+= ' position:absolute;';
					str+= ' left:'		    + Number(x + ( Math.abs(o.width) / 2)) + 'px;';
					str+= ' top:'		    + y + 'px;';
					str+= ' color:'		    + o.fillStyle + ';';
					str+= ' font-size:'	    + o.fontSize + 'px;';
					str+= ' font-family:'	+ o.font + ';';
					if(o.addToExportStyle) str += o.addToExportStyle + ';';
					if(o.shadowOffsetX || o.shadowOffsetY || o.shadowBlur || o.shadowColor) str+= ' text-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
					if(o.rotate)   str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
					if(o.isBold)   str+= ' font-weight:bold;';
					if(o.isItalic) str+= ' font-style:italic;';
					str+= ' alignment-baseline:before-edge';
					str+= '" ><div keepDirection="1" style="display:inline-block;position:relative;left:50%;"><div keepDirection="1" style="margin-left:-50%;white-space:nowrap;text-align:left;">'+o.text+'</div></div></div>';

				o.onExport = str;

			}

		}

		return objects;
	},

	reposition : function()
	{
		var canvasLeft   = $('#canvas').css('left'),
			canvasLeft   = Number(canvasLeft.replace('px','')),
			canvasHeight = $('#canvas').height();

		$('.toolbox.designs').css('left', canvasLeft + 'px');
		$('.toolbox.objects').css('left', canvasLeft + 810 + 'px');
		$('.toolbox.resources').css('left', canvasLeft + 526 + 'px');
		$('.toolbox.text').css('left', canvasLeft + 'px');
		$('.toolbox.templates').css('left', canvasLeft + 'px');

		$('.toolbox').css('top', canvasHeight + 97 + 4 + 'px').css('right', 'initial');

	}

}

var closeDesigner = $('<div class="closeDesignerWrapper"></div>'),
	previewHtml   = $('<div class="previewHtml left button">Preview</div>'),
	saveTemplate  = $('<div class="saveTemplate left button">'+getString('save2')+'</div>'),
	closeButton   = $('<div class="closeDesigner left button">'+getString('Close')+'</div>'),
	clearDiv      = $('<div class="clear"></div>');

closeDesigner.append(previewHtml);
closeDesigner.append(saveTemplate);
closeDesigner.append(closeButton);
closeDesigner.append(clearDiv);

$('body').append(closeDesigner);

window.parent.scrollTo(0,0);
window.parent.$('html').css('height','100%').css('overflow','hidden')

templateEditor.init();


/* HELPERS */

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

// todos
// - images should also be dynamic
// - export objects and replace
// - handle ltr / rtl

// crossbrowser issues
// -------------------

// FIREFOX

// + medium   - css zoom issue on preview image - customerDetails 
// + minor    - preview button text bleeds - customerDetails
// + minor    - tools background color is blue - templateEditor
// + medium   - some of the texts moved a bit to the top when comparing to chrome - templateEditor
// + critical - scrolling doesn't work in the 'objects' toolbox, dragging the scroller causes entire toolbox to drag - templateEditor
// + critical - dragging an image from 'resources' toolbox to canvas doesn't work - templateEditor (same bug in explorer)

// EXPLORER 9,10,11

// + medium   - preview image appears smaller - customerDetails
// + critical - poor toolboxes display and movement behavior - templateEditor
// + minor    - tools background color is blue (like firefox) - templateEditor
// + critical - main menu doesn't show (shows undefined) also menu shortcuts doesn't work - templateEditor
// + critical - wrong scrolling behavior on 'objects' toolbox, on mouseup the toolbox starts dragging - templateEditor
// + critical - dragging an image from 'resources' toolbox to canvas doesn't work - templateEditor (same bug in firefox)
