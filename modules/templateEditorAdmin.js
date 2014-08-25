//@ sourceURL=templateEditorAdmin.js

console.log('templateEditorAdmin');

// admin for creating template designs

var canvasLeft = $('#canvas').css('left'),
	canvasLeft = Number(canvasLeft.replace('px',''));

new editor.toolbox({

	name    : 'designs',
	title   : 'Designs',
	visible : true,
	width   : 200,

	preLoad : function(){ this.getData(); },
	onLoad  : function(){},
	render  : function(){
		$('.toolbox.designs .body').empty();
		$('.toolbox.designs .menu').remove();
		for(i in this.designs)
		{
			item = this.designs[i];
			if(item.isActive) active='active'; else active = '';
			$('.toolbox.designs .body').append('<div class="item" id="'+item.id+'"><div class="left"><div class="title">'+item.title+'</div><div class="type">'+getString(item.type)+'</div></div><div class="right"><div class="right isActive '+active+'"></div><div title="'+getString('load')+'" class="right load"></div><div class="clear"></div></div><div class="clear"></div></div>');
		}
		$('.toolbox.designs').append('<div class="menu"></div>');
		$('.toolbox.designs .menu').append('<div class="item add right">'+getString('new')+'</div>');
		$('.toolbox.designs .menu').append('<div class="item delete disabled right"></div>');
		$('.toolbox.designs .menu').append('<div class="clear"></div>');
	},
	redraw  : function(){},
	events  : function(){
		
	},
	getData : function(){
		$.ajax({
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/getDesigns",
			dataType    : "json",
			success     : $.proxy(function ( data )
			{
				data = $.parseJSON(data.d);
				for(i in data)
				{
					design = data[i];
					d.push({
						id       : design.ID,
						title    : design.Name,
						type     : design.Type,
						isActive : design.Active 
					});
					this.designs = d;
				}
				this.render();
				this.events();
			},this)
		});
	}

})

$('.toolbox.designs').css('left', canvasLeft + 310 + 'px');
$('.toolbox.designs').css('top', '354px');
$('.toolbox.designs').css('right', 'initial');