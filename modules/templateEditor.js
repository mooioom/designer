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

// setup ui

var canvasLeft = $('#canvas').css('left'),
	canvasLeft = Number(canvasLeft.replace('px',''));

$('.toolbox.objects').css('left', canvasLeft + 766 + 'px');
$('.toolbox.objects').css('top', '354px');
$('.toolbox.objects').css('right', 'initial');

$('.toolbox.resources').css('left', canvasLeft + 526 + 'px');
$('.toolbox.resources').css('top', '354px');
$('.toolbox.resources').css('right', 'initial');

// get templates - << API

new editor.toolbox({

	name    : 'templates',
	title   : getString('templates'),
	visible : true,
	width   : 308,

	preLoad : function(){
		this.getData();
	},

	onLoad : function(){

	},

	render : function(){
		// render the toolbox custom ui
		$('.toolbox.templates .body').empty();
		$('.toolbox.templates .menu').remove();
		$('.toolbox.templates .body').append('<div class="item header"><div class="left">'+getString('title')+' + '+getString('type')+'</div><div class="right">'+getString('active')+'?</div><div class="clear"></div></div>');
		for(i in this.templates)
		{
			item = this.templates[i];
			if(item.isActive) active='active'; else active = '';
			$('.toolbox.templates .body').append('<div class="item" id="'+item.id+'"><div class="left"><div class="title">'+item.title+'</div><div class="type">'+getString(item.type)+'</div></div><div class="right"><div class="right isActive '+active+'"></div><div title="'+getString('load')+'" class="right load"></div><div class="clear"></div></div><div class="clear"></div></div>');
		}
		$('.toolbox.templates').append('<div class="menu"></div>');
		$('.toolbox.templates .menu').append('<div class="item add right">'+getString('new')+'</div>');
		$('.toolbox.templates .menu').append('<div class="item delete disabled right"></div>');
		$('.toolbox.templates .menu').append('<div class="clear"></div>');
	},

	redraw : function(){

	},

	events : function(){
		// setup toolbox custom	events
		$('.toolbox.templates .body .item .load').click( $.proxy(this.load,      this) );
		$('.toolbox.templates .body .isActive').click(   $.proxy(this.isActive,  this) );
		$('.toolbox.templates .menu .add').click(        $.proxy(this.add,       this) );
		$('.toolbox.templates .menu .delete').click(     $.proxy(this.delete,    this) );
	},

	getData : function()
	{
		$.ajax({
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/init",
			dataType    : "json",
			success     : $.proxy(function ( data )
			{
				data = $.parseJSON(data.d);
				for(i in data.templates)
				{
					template = data.templates[i];
					d.push({
						id       : template.ID,
						title    : template.Name,
						type     : template.Type,
						height   : template.Height,
						isActive : template.Active 
					});
					this.templates = d;
				}
				if(!this.templates) this.create( true );
				this.render();
				this.events();
			},this),
			error : $.proxy(function(){ this.create(); },this)
		});
	},

	create : function( firstRun ){

		var header       = getString('CreateATemplate'),
			content      = getString('SelectADesign'),
			firstRunText = '';

		if( firstRun ) firstRunText = '<div class="firstTime">'+getString('FirstTimeUsing')+'</div>';

		content = firstRunText + content;

		var designs    = this.getDesigns(),
			designsDiv = $('<div class="designs"></div>');

		for(i in designs)
		{
			var design    = designs[i],
				heightStr = '',
			  	selected  = ''; if(i == 0) selected = 'selected';

			if(design.height) heightStr = ', ' + getString('Height') + ' : ' + design.height + 'px';

			designsHolder       = $('<div class="design '+selected+'" dataid="'+design.id+'"></div>');
			designsTitleHolder  = $('<div class="left"></div>');
			designsTitle        = $('<div class="designTitle">'+design.title+'</div>');
			//designsInfo1        = $('<div class="designInfo1">'+design.desc+'</div>');
			designsInfo2        = $('<div class="designInfo2">'+getString('type')+' : '+getString(design.type)+heightStr+'</div>');
			designsImg          = $('<div class="left designImg"><img src="'+design.img+'" /></div>');
			designsTitleHolder.append(designsTitle);
			//designsTitleHolder.append(designsInfo1);
			designsTitleHolder.append(designsInfo2);
			designsHolder.append(designsImg).append(designsTitleHolder).append('<div class="clear"></div>');
			designsDiv.append(designsHolder);
		}

		var createPopup = new Popup({
			enable     : true,
			header     : header,
			content    : '<div>'+content+'</div><div class="designs">'+designsDiv.html()+'</div>',
			actionText : getString('Continue'),
			closeText  : getString('Cancel'),
			onLoad     : function()
			{
				$('.design').click(function(){ $('.design').removeClass('selected'); $(this).addClass('selected'); })
			},
			action     : $.proxy(function()
			{
				var selecteddesignId = Number($('.design.selected').attr('dataid'));
				$('.popupLoading').hide();
				$('.popupContent').empty();
				templateDataTitle 	   = $('<div class="TemplateNameSize">Select Template Name & Height</div>')
				templateData      	   = $('<div class="TemplateData"></div>');
				templateDataLeft  	   = $('<div class="left"></div>');
				templateDataRight      = $('<div class="left sizeDiv"></div>');
				templateDataLeftTitle  = $('<div class="title">'+getString('TemplateName')+'</div>');
				templateDataLeftInput  = $('<div class="input"><input type="text" id="TemplateName" value="'+getString('UntitledTemplate')+'" /></div>');
				templateDataRightTitle = $('<div class="title">'+getString('Height')+'</div>');
				templateDataRightInput = $('<div class="input"><input type="text" id="TemplateHeight" />px</div>');
				templateDataLeft.append(templateDataLeftTitle).append(templateDataLeftInput);
				templateDataRight.append(templateDataRightTitle).append(templateDataRightInput);
				templateData.append(templateDataLeft).append(templateDataRight).append('<div class="clear"></div>');
				$('.popupContent').append(templateDataTitle).append(templateData);
				$('.popupButtonA').html(getString('Create'));
				$('.popupButtonA').click($.proxy(function(){
					this.setupTemplate( selecteddesignId );
					createPopup.close();	
				},this))
				
			},this)
		});

	},

	getDesigns : function(){

		// load designs

		return [
			{
				id     : 0,
				title  : 'Basic Header Template',
				desc   : 'This is a basic template with a simple logo design, title and some basic information...',
				type   : 'header',
				height : 253,
				img    : ''
			},
			{
				id     : 1,
				title  : 'Basic Footer Template',
				desc   : 'A Basic footer template, logo, address and information',
				type   : 'footer',
				height : 180,
				img    : ''
			},
			{
				id    : 2,
				title : 'Blank Header Template',
				desc  : 'Empty Header Template',
				type  : 'header',
				img   : ''
			},
			{
				id    : 3,
				title : 'Blank Footer Template',
				desc  : 'Empty Footer Template',
				type  : 'footer',
				img   : ''
			}
		];

	},

	setupTemplate : function( designId ){

		$.ajax({
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/setupTemplate",
			data        : JSON.stringify({designId : designId}),
			dataType    : "json",
			success     : $.proxy(function ( data )
			{
				console.log( data );
			},this)
		});

	},

	load : function( e ){
		e.preventDefault(); e.stopPropagation();

		var item  = $(e.target).parent().parent(),
			id    = Number(item.attr('id')),
			title = item.find('.title').html();

		var loadPopup = new Popup({
			header     : getString('load')+' '+title,
			content    : getString('unsavedData'),
			actionText : getString('load'),
			closeText  : getString('Cancel'),
			action     : function()
			{
				loadPopup.close();
			}
		});
	},

	isActive : function( e ){
		e.preventDefault(); e.stopPropagation();
		console.log('isActive',this);
	},

	add : function(){
		this.create();
	},

	delete : function(){
		console.log('delete',this);
	}

});

$('.toolbox.templates').css('left', canvasLeft + 'px');
$('.toolbox.templates').css('top', '354px');
$('.toolbox.templates').css('right', 'initial');