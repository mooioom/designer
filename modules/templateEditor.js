//@ sourceURL=templateEditor.js

console.log('templateEditor',editor);

$('.toolbar.text .clear').remove();
$('.toolbar.text').append('<div class="sep dynamicInput hidden"></div>');
$('.toolbar.text').append('<div class="item dynamicInput hidden"><div class="left">Dynamic Data : <select id="dynamicFields"></select></div><div class="left"><div class="toolbarButtonB removeDynamicData">Make Static Text</div></div><div class="clear"></div></div>');
$('.toolbar.text').append('<div class="sep chooseDataType hidden"></div>');
$('.toolbar.text').append('<div class="item chooseDataType hidden"><div class="toolbarButtonB left dynamicData">Make Dynamic Data</div><div class="toolbarButtonB left globalizedString">Make Globalized String</div><div class="clear"></div></div>');
$('.toolbar.text').append('<div class="clear"></div>');

// get dynamic dynamicFields - << API

dynamicFields = [
	{ label : 'User Name',     value : 'valueUserName', display : '<userName>', type : 'dynamic' },
	{ label : 'User Address',  value : 'valueUserAddress', display : '<userAddress>', type : 'dynamic' },
	{ label : 'Serial Number', value : 'valueSerialNumber', display : '<serialNumber>', type : 'dynamic' },
	{ label : 'Meter Number',  value : 'valueMeterNumber', display : '<meterNumber>', type : 'dynamic' },
	{ label : 'Bill Period',   value : 'valueBillPeriod', display : '<billPeriod>', type : 'dynamic' }
]

// --- end of stub

for(i in dynamicFields){

	field = dynamicFields[i];
	$('#dynamicFields').append('<option data="'+field.value+'" value="'+field.display+'">'+field.label+'</option>');

}

$('#dynamicFields').change(function(){

	if(editor.selecteds.length) editor.selecteds[0].dynamic = $(this).val();

});

$('.removeDynamicData').click(function(){
	if(editor.selecteds.length) {
		if(editor.selecteds[0].dynamic) delete editor.selecteds[0].dynamic;
		$('.chooseDataType').show();
		$('.dynamicInput').hide();
	}
})

editor.onSelect = function(){
	//console.log('onSelect');
}

editor.onToolChange = function(){
	if(editor.action == 'text'){
		$('.chooseDataType').hide();
		$('.dynamicInput').hide();
	}else editor.onMouseUp();
}

editor.onMouseUp = function(){
	console.log('onMouseUp');
	$('.chooseDataType').hide();
	$('.dynamicInput').hide();
	if( editor.helpers.selectedIsText() )
	{
		text = editor.selecteds[0];
		if(text.dynamic){
			$('.dynamicInput').show();
			$('#dynamicFields').val(text.dynamic);
		}
		else if(text.globalized){
			// 
		}
		else{
			$('.chooseDataType').show();
		}
	}
}

$('.dynamicData').click(function(){
	$('.chooseDataType').hide();
	$('.dynamicInput').show();
});

templateEditor = {

	id        : 0,
	type      : "",
	isAudited : 0,

	init : function(){

		this.id   = Number(getParams().id);
		this.type = getParams().type;
		this.isAudited = getParams().audited;
		this.events();
		this.load();

	},

	events : function(){

		$('.closeDesigner').click(function(){
			window.parent.$('html').css('height','initial').css('overflow','initial');
			window.parent.closeDesigner();
		});

		$('.saveTemplate').click($.proxy(this.save,this));

		$(window).resize( templateEditor.reposition );

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