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

	},

	getData : function(){

		//get available dynamic fields from server
		this.dynamicFields = [
			{ label : 'User Name',     value : 'valueUserName', display : '<userName>', type : 'dynamic' },
			{ label : 'User Address',  value : 'valueUserAddress', display : '<userAddress>', type : 'dynamic' },
			{ label : 'Serial Number', value : 'valueSerialNumber', display : '<serialNumber>', type : 'dynamic' },
			{ label : 'Meter Number',  value : 'valueMeterNumber', display : '<meterNumber>', type : 'dynamic' },
			{ label : 'Bill Period',   value : 'valueBillPeriod', display : '<billPeriod>', type : 'dynamic' }
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

		for(i in this.dynamicFields){

			field = this.dynamicFields[i];
			$('#dynamicFields').append('<option data="'+field.value+'" value="'+field.display+'">'+field.label+'</option>');

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
				}
				else if(text.globalized){
					$('.globalizedString').show();
					$('#globalizedString').val(text.globalized.text);
					$('.globalizedGlobe').removeClass('disabled');
				}
				else $('.chooseDataType').show();
			}
		}

		$('.dynamicData').click(function(){
			$('.chooseDataType').hide();
			$('.dynamicInput').show();
		});

		$('.globalizedStringButton').click(function(){
			$('.chooseDataType').hide();
			$('#globalizedString').val('');
			$('.globalizedGlobe').addClass('disabled');
			$('.globalizedString').show();
		});

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

			$('#new,#save,#load').hide();
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
		//todo :: replace text to dynamic markup 
		objects = $.extend(true,{},editor.objects);

		// dynamic markup should export :
		// 1. dynamic fields
		// 2. globalized fields
		// 3. preview data

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
			{ id : this.id, type : this.type, height : height, data : editor.file.getData(), html : editor.file.getHtml( {objects:objects} ) }
		)
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

$('body').append('<div class="closeDesignerWrapper"><div class="saveTemplate left button">'+getString('save2')+'</div><div class="closeDesigner left button">'+getString('Close')+'</div><div class="clear"></div></div>');

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
