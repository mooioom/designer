//@ sourceURL=templateEditorAdmin.js

console.log('templateEditorAdmin');

// admin for creating template designs

new editor.toolbox({

	templateUrl : 'modules/templateEditorAdmin.html',

	name    : 'designs',
	title   : 'Designs',
	visible : true,
	width   : 200,

	designs : [],

	preLoad : function(){ this.getData(); },
	onLoad  : function(){

		this.reposition(); 
		$('#new,#save,#load').show();

	},

	redraw  : function(){
		this.render();
		this.events();
	},

	render  : function(){
		$('.toolbox.designs .body').empty();
		$('.toolbox.designs .menu').remove();

		for(i in this.designs)
		{
			item      = $.extend(true,{},this.designs[i]);
			//item.type = getString(item.type);
			this.append('.body','.item',item);
		}

		$('.toolbox.designs').append('<div class="menu"></div>');
		$('.toolbox.designs .menu').append('<div class="item add right">'+getString('new')+'</div>');
		$('.toolbox.designs .menu').append('<div class="item delete disabled right"></div>');
		$('.toolbox.designs .menu').append('<div class="clear"></div>');

		if(this.hasSelected()) $('.delete',this.el).removeClass('disabled');

		this.reposition();

	},
	
	events  : function(){
		$('.body .item',this.el).click(       $.proxy(this.load,      this) );
		$('.body .item .save',this.el).click( $.proxy(this.save,      this) );
		$('.body .isActive',this.el).click(   $.proxy(this.isActive,  this) );
		$('.menu .add',this.el).click(        $.proxy(this.add,       this) );
		$('.menu .delete',this.el).click(     $.proxy(this.delete,    this) );
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

	getData : function(){

		this.api(
			'getDesigns',
			function ( data ) {
				data         = $.parseJSON(data.d);
				this.designs = [];
				for(i in data)
				{
					design = data[i];
					this.designs.push({
						id       : design.ID,
						title    : design.Name,
						type     : design.Type,
						height   : design.Height,
						isActive : design.Active,
						data     : design.Data
					});
				}
				if(this.designs.length) this.redraw();
			}
		);

	},
	
	load : function( e ){

		var item = $(e.target).closest('.item'),
			id   = Number(item.attr('id')),
			type = $('.type',item).attr('type').toLowerCase();

		this.api(
			'getDesign',
			function( data ){
				data   = $.parseJSON(data.d);
				design = data[0];
				this.select( design.ID );
				if( design )
				{
					editor.reset();
					editor.init({
						name    : design.Name,
					    width   : 1024,
						height  : Number(design.Height),
						data    : design.Data
					});
					this.redraw();
				}
			}, 
			{ type : type, id : id } 
		);

	},
	select : function( id ){
		for(i in this.designs)
		{
			d = this.designs[i]
			d.selected = false;
			if(id == d.id) d.selected = true;
		}
	},
	save : function( e ){
		e.preventDefault(); e.stopPropagation();
		objects = $.extend(true,{},editor.objects);
		//depends on templateEditor.js
		this.api(
			'saveDesign',
			function( data ){
				if(data) console.log('saved');
			},
			{ id : this.hasSelected(), data : editor.file.getData(), html : editor.file.getHtml( {objects:templateEditor.transformObjects(objects)} )  }
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
	delete : function( e ){
		e.preventDefault(); e.stopPropagation();
		id = this.hasSelected();
		if(!id) return;
		deletePop = new Popup({
			header     : 'Are you sure?',
			content    : 'Are you sure you want to delete the selected design?',
			actionText : 'Delete',
			closeText  : 'Cancel',
			action     : $.proxy(function(){
				this.api(
					'removeDesign',
					function(data){if(data.d)this.getData();},
					{id:id}
				);
				deletePop.close();
			},this)
		})
	},
	isActive : function(){

	},
	add : function(){

		data = {
			nameTitle   : getString('TemplateName'),
			nameValue   : getString('UntitledTemplate'),
			heightTitle : getString('Height'),
			heightValue : 253,
			type        : getString('type'),
			header 		: getString('header'),
			footer  	: getString('footer')
		}

		html = this.template.find('.designCreate').outerHTML();
		content = Mustache.to_html(html,data);

		var createPopup = new Popup({
			enable     : true,
			header     : getString('CreateATemplate'),
			content    : content,
			actionText : getString('Create'),
			closeText  : getString('Cancel'),
			action     : $.proxy(function()
			{

				var name   = $('#TemplateName').val(),
					height = $('#TemplateHeight').val(),
					type   = $('#TemplateType').val();

				this.setupDesign( name,type,height );
				createPopup.close();
				
			},this)
		});
	},
	setupDesign : function( name, type, height ){

		this.api(
			'setupDesign',
			function(data){if(data.d)this.getData();},
			{name:name,height:height,type:type}
		);

	},
	append : function( el, templateItem, data){
		html = this.template.find(templateItem).outerHTML();
		html = Mustache.to_html(html,data);
		$(el,this.el).append(html);
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

	},
	hasSelected : function(){ a = this.designs; for(i in a) if(a[i].selected) return a[i].id;}

});

var canvasLeft = $('#canvas').css('left'),
	canvasLeft = Number(canvasLeft.replace('px','')),
	canvasHeight = $('#canvas').height();

$('.toolbox.designs').css('left', canvasLeft + 310 + 'px');
$('.toolbox.designs').css('top', canvasHeight + 97 + 4 + 'px');
$('.toolbox.designs').css('right', 'initial');