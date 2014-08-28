
$.extend( true, editor, {

	ui : {

		toolbox : {

			init : function(){

				// new this.parent.parent.toolbox({

				// 	name    : 'objects2',
				// 	title   : 'Objects2',
				// 	visible : true,
				// 	width   : 200,

				// 	redraw  : function(){
				// 		this.render();
				// 		this.events();
				// 	},

				// 	prepend : function( el, templateItem, data ){
				// 		html = $('#ceTemplates2').find(templateItem).outerHTML();
				// 		html = Mustache.to_html(html,data);
				// 		$(el,this.el).prepend(html);
				// 	},

				// 	preLoad : function(){},
				// 	onLoad  : function(){},
				// 	render  : function(){

				// 		$('.body',this.el).empty();
				// 		$('.menu',this.el).remove();

				// 		$('.body',this.el).removeClass('sortable').addClass('sortable');

				// 		for(i in this.parent.objects)
				// 		{
				// 			object = $.extend(true,{},this.parent.objects[i]);
				// 			if(this.parent.helpers.isObjectSelected(object.id)) object.selected = true;
				// 			title = object.type; if(object.src) title = 'image';
				// 			title += ' ' + object.id; if(object.type == 'text') title += ' - ' + object.text;
				// 			title = title.capitalize();
				// 			object.title = title;
				// 			this.prepend('.body','.objectsItem.ver2',object);
				// 		}

				// 		this.el.append('<div class="menu"></div>');

				// 		$('.menu',this.el).append('<div class="item add right">'+getString('new')+'</div>');
				// 		$('.menu',this.el).append('<div class="item delete disabled right"></div>');
				// 		$('.menu',this.el).append('<div class="clear"></div>');
				// 	},
				// 	events  : function(){

				// 		$('.sortable').multisortable({
				// 			items         : ".objectsItem",
				// 			selectedClass : "selected",
				// 			stop          : $.proxy(function(){ 
				// 				this.parent.render.reOrderByUi();
				// 				this.parent.helpers.toggleObjectsOptions();
				// 			},this),
				// 			click         : $.proxy(function(){
				// 				this.parent.render.reOrderByUi(); 
				// 				this.parent.helpers.toggleObjectsOptions();
				// 			},this)
				// 		});

				// 		$('.objectVisible',this.el).unbind('click').bind('click',function(){
				// 			$(this).toggleClass('invisible');
				// 			editor.selecteds[0].visible = !$(this).hasClass('invisible');
				// 			editor.render();
				// 		});

				// 		$('.objectLock',this.el).unbind('click').bind('click',function(){
				// 			$(this).toggleClass('unlocked');
				// 			editor.selecteds[0].locked = !$(this).hasClass('unlocked');
				// 			editor.render();
				// 		});

				// 	}

				// });

				$('.toolbox').draggable({ 
					start       : function(){ $(this).css('right','initial'); },
					containment : "window"
				});

				$(document).on('click', '.toolbox .close', function () {
					$(this).parent().hide();
				});

				$(document).on('click', '.toolbox.objects .objectVisible', function () {
					$(this).toggleClass('invisible');
					editor.selecteds[0].visible = !$(this).hasClass('invisible');
					editor.render();
				});
				
				$(document).on('click', '.toolbox.objects .objectLock', function () {
					$(this).toggleClass('unlocked');
					editor.selecteds[0].locked = !$(this).hasClass('unlocked');
					editor.render();
				});

				$('.toolbox.objects .menu .delete').click( function(){ editor.functions.delete(); });
				$('.toolbox.objects .menu .add').click( function() { 
					editor.create.box(0,0,editor.width,editor.height);
					editor.render(); 
					editor.draw.ui();
					editor.draw.toolbar();
					editor.draw.reOrderByUi( true );
				});

				//grid
				$('.toolbox.grid input[type="text"]').keyup(function(){
					if(!$(this).val()) return;
					editor.grid[$(this).attr('id')] = $(this).val();
					editor.draw.grid();
				});

				$('.toolbox input[type="range"]').change(function(){
					var prop = $(this).attr('class');
					o = editor.selecteds[0];
					if( !o ) return;
					if( o.locked || !o.visible ) return;
					o[prop] = $(this).val();
					editor.render();
				});

				$('.toolbox input[type="range"]').mousedown(function(){
					editor.history.save();
				});

				$('.toolbox.grid #visible').change(function(){
					editor.grid.visible = $(this).prop('checked');
					editor.draw.grid.apply(ce);
				});

				$('.toolbox.grid #snap').change(function(){
					editor.grid.snap = $(this).prop('checked');
					editor.draw.grid();
				});

				$('.toolbox .menu .item.shadow').click(function(){ $('.toolbox.shadow').show(); });
				$('.toolbox .menu .item.transform').click(function(){ $('.toolbox.transform').show(); });

				//text
				$('.toolbox.text').hide();
				$('.toolbox.text #text').bind('keyup change keydown',function(){ editor.functions.changeText( $(this).val() ); });

			},

			update : function( o ){

				$('.toolbox.transform .rotate').val( o.rotate );
				$('.toolbox.shadow .shadowBlur').val(    o.shadowBlur    );
				$('.toolbox.shadow .shadowOffsetX').val( o.shadowOffsetX );
				$('.toolbox.shadow .shadowOffsetY').val( o.shadowOffsetY );
				$(".toolbox.shadow .shadowColor").spectrum("set", o.shadowColor);

			},

			toggle : function( item ){

				$('.toolbox.'+item).toggle();

			}

		},

		toolbar : {

			init : function(){

				$('#selectAndMove').click(function(){ editor.selectAndMove = $(this).prop('checked'); });

				$('.toolbar .link').click(function(){
					$(this).toggleClass('unlinked');
					editor.resizeLinked = !$(this).hasClass('unlinked');
				})

				$('.toolbar input, .toolbar select').bind('keyup change',function( e ){
					
					if($(this).attr('data')!='string')
					{
						if (e.keyCode == 37) {} //left
						if (e.keyCode == 38) { $(this).val( Number( $(this).val() )+ editor.grid.size ) } // up
						if (e.keyCode == 39) {} //right
						if (e.keyCode == 40) { $(this).val( Number( $(this).val() )- editor.grid.size ) } // down
					}
					var val = $(this).val();
					if( $(this).attr('type') == 'checkbox' ) val = $(this).prop('checked');
					editor.helpers.updateSelectedObjProp( $(this).attr('class'), val, $(this).attr('data'));
					editor.render();
				});

				$('.toolbarButton.align').click(function(){
					var type = $(this).attr('type');
					editor.functions['align'+type]();
				});

			},

			update : function( o ){

				$('.toolbar.'+o.type+' .startX').val(      o.startX 	 );
				$('.toolbar.'+o.type+' .startY').val( 	   o.startY 	 );
				$('.toolbar.'+o.type+' .width').val( 	   o.width 		 );
				$('.toolbar.'+o.type+' .height').val( 	   o.height 	 );
				$('.toolbar.'+o.type+' .lineWidth').val(   o.lineWidth 	 );
				$('.toolbar.'+o.type+' .strokeStyle').val( o.strokeStyle );
				$('.toolbar.'+o.type+' .radius').val( 	   o.radius 	 );
				$('.toolbar.'+o.type+' .fill').val( 	   o.fill 		 );
				$('.toolbar.'+o.type+' .opacity').val();

				$(".toolbar .fill").spectrum("set", 	   o.fill        );
				$(".toolbar .fillStyle").spectrum("set",   o.fillStyle   );
				$(".toolbar .strokeStyle").spectrum("set", o.strokeStyle );

			}

		},

		indicator : {

			show : function( message ){

				if(!$('#indicator').length)$('body').append('<div id="indicator"></div>');
				$('#indicator').addClass('animate').html(message).addClass('show');

			},

			hide : function(){
				$('#indicator').removeClass('animate')
							   .addClass('show')
							   .addClass('animate')
							   .removeClass('show');
			}

		}

	}

});