//@ sourceURL=templateEditor.js

console.log('templateEditor',editor);

$('.toolbar.text .clear').remove();
$('.toolbar.text').append('<div class="item">'+getString('dynamicField')+' : <select id="dynamicFields"></select></div>');
$('.toolbar.text').append('<div class="clear"></div>');

// get dynamic dynamicFields - << API

dynamicFields = [
	{ label : 'Title : User Name', value : 'titleUserName', display : 'User Name' , type : 'text' },
	{ label : 'Value : User Name', value : 'valueUserName', display : '<userName>', type : 'dynamic' },
	{ label : 'Title : User Address', value : 'titleAddress', display : 'Address', type : 'text' },
	{ label : 'Value : User Address', value : 'valueUserAddress', display : '<userAddress>', type : 'dynamic' },
	{ label : 'Title : Serial Number', value : 'titleSerialNumber', display : 'Serial Number', type : 'text' },
	{ label : 'Value : Serial Number', value : 'valueSerialNumber', display : '<serialNumber>', type : 'dynamic' },
	{ label : 'Title : Meter Number', value : 'titleMeterNumber', display : 'Meter Number', type : 'text' },
	{ label : 'Value : Meter Number', value : 'valueMeterNumber', display : '<meterNumber>', type : 'dynamic' },
	{ label : 'Title : Bill Period', value : 'titleBillPeriod', display : 'Bill Period', type : 'text' },
	{ label : 'Value : Bill Period', value : 'valueBillPeriod', display : '<billPeriod>', type : 'dynamic' }
]

// --- end of stub

for(i in dynamicFields){

	field = dynamicFields[i];
	$('#dynamicFields').append('<option data="'+field.value+'" value="'+field.display+'">'+field.label+'</option>');

}

$('#dynamicFields').change(function(){

	if(editor.selecteds.length)
	{
		editor.selecteds[0].text = $(this).val();
		editor.redraw();
	}

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

			//$('#new,#save,#load').hide();
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
		$('.toolbox.resources').css('left', canvasLeft + 570 + 'px');
		$('.toolbox.text').css('left', canvasLeft + 'px');
		$('.toolbox.templates').css('left', canvasLeft + 'px');

		$('.toolbox').css('top', canvasHeight + 97 + 4 + 'px').css('right', 'initial');

	}

}

$('body').append('<div class="closeDesignerWrapper"><div class="saveTemplate left button">'+getString('save2')+'</div><div class="closeDesigner left button">'+getString('Close')+'</div><div class="clear"></div></div>');

// window.parent.$("html, body").animate({ scrollTop: 0 }, "slow",function(){
// 	window.parent.$('html').css('height','100%').css('overflow','hidden')
// });

window.parent.scrollTo(0,0);
window.parent.$('html').css('height','100%').css('overflow','hidden')

templateEditor.init();


/*
	TODOS :

	1. dynamic properties (strings, logo etc...)
	2. color picker tool


*/