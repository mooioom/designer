
$.extend( true, editor, {

	ui : {

		toolbox : {

			init : function(){

				new this.parent.parent.toolbox({

					name    : 'objects',
					title   : 'Objects',
					visible : true,

					redraw  : function(){
						this.render();
						this.events();
					},

					prepend : function( el, templateItem, data ){
						html = $('#ceTemplates').find(templateItem).outerHTML();
						html = Mustache.to_html(html,data);
						$(el,this.el).prepend(html);
					},

					preLoad : function(){},
					onLoad  : function(){},
					render  : function(){

						$('.body',this.el).empty();
						$('.menu',this.el).remove();

						$('.body',this.el).removeClass('sortable').addClass('sortable');

						for(i in this.parent.objects)
						{
							object = $.extend(true,{},this.parent.objects[i]);
							if(this.parent.helpers.isObjectSelected(object.id)) object.selected = true;
							title = object.type; if(object.src) title = 'image';
							title += ' ' + object.id; if(object.type == 'text') title += ' - ' + object.text;
							title = title.capitalize();
							object.title = title;
							this.prepend('.body','.objectsItem',object);
						}

						this.el.append('<div class="menu"></div>');

						$('.menu',this.el).append('<div class="item add right">'+getString('new')+'</div>');
						$('.menu',this.el).append('<div class="item delete disabled right"></div>');
						$('.menu',this.el).append('<div class="item shadow disabled left">Shadow</div>');
						$('.menu',this.el).append('<div class="item transform disabled left">Transform</div>');
						$('.menu',this.el).append('<div class="item fx disabled left">fx</div>');
						$('.menu',this.el).append('<div class="clear"></div>');

						this.toggleOptions();

						
					},
					events  : function(){

						$('.sortable').multisortable({
							items         : ".objectsItem",
							selectedClass : "selected",
							stop          : $.proxy(function(){ 
								this.parent.draw.reOrderByUi();
								this.toggleOptions();
							},this),
							click         : $.proxy(function(){
								this.parent.draw.reOrderByUi(); 
								this.toggleOptions();
							},this)
						});

						$('.objectVisible',this.el).unbind('click').bind('click',$.proxy(function( e ){
							e.preventDefault(); e.stopPropagation();
							$(e.target).toggleClass('invisible');
							id = Number($(e.target).parent().attr('objectid'));
							this.parent.functions.getObject(id).visible = !$(e.target).hasClass('invisible');
							this.parent.render();
						},this));

						$('.objectLock',this.el).unbind('click').bind('click',$.proxy(function( e ){
							e.preventDefault(); e.stopPropagation();
							$(e.target).toggleClass('unlocked');
							id = Number($(e.target).parent().attr('objectid'));
							this.parent.functions.getObject(id).locked = !$(e.target).hasClass('unlocked');
							this.parent.render();
						},this));

						$('.delete',this.el).unbind('click').bind('click',$.proxy(function(){
							this.parent.functions.delete();
						},this));

						$('.shadow',this.el).unbind('click').bind('click',$.proxy(function(){
							$('.toolbox.shadow').show();
						},this));

						$('.transform',this.el).unbind('click').bind('click',$.proxy(function(){
							$('.toolbox.transform').show();
						},this));

						$('.add',this.el).unbind('click').bind('click',$.proxy(function(){
							this.parent.create.box(0,0,this.parent.width,this.parent.height);
							this.parent.render(); 
							this.parent.draw.ui();
							this.parent.draw.toolbar();
							this.parent.draw.reOrderByUi( true );
						},this));

					},
					toggleOptions : function(){
						if(this.parent.selecteds && this.parent.selecteds.length) {
							$('.shadow',   this.el).removeClass('disabled');
							$('.transform',this.el).removeClass('disabled');
							$('.delete',   this.el).removeClass('disabled');
						}
						else {
							$('.shadow',   this.el).addClass('disabled');
							$('.transform',this.el).addClass('disabled');
							$('.delete',   this.el).addClass('disabled');
						}
					}

				});

				new this.parent.parent.toolbox({

					name    : 'resources',
					title   : 'Resources',
					visible : true,

					redraw  : function(){
						this.render();
						this.events();
					},

					prepend : function( el, templateItem, data ){
						html = $('#ceTemplates').find(templateItem).outerHTML();
						html = Mustache.to_html(html,data);
						$(el,this.el).prepend(html);
					},

					preLoad : function(){

						$('body').append('<div id="" class="hidden"></div>');

						// init browser drop event for files
						this.parent.events.browserDropEvents.push($.proxy(function(e){

							if(!e.originalEvent.dataTransfer) return;
							e.originalEvent.stopPropagation();
							e.originalEvent.preventDefault();
							var dt    = e.originalEvent.dataTransfer,
								files = dt.files;
								
							if(!files || !dt.files.length) return;
							var file = dt.files[0];
							if (!file.type.match('image')) return;

							var reader = new FileReader();

							reader.onload = ($.proxy(function(theFile) {
								return $.proxy(function(e) {
									this.parent.resources.push({
										src       : e.target.result,
										name      : theFile.name,
										size      : theFile.size,
										type      : theFile.type
									});
									this.redraw();
								},this);
							},this))(file);
							// Read in the image file as a data URL.
							reader.readAsDataURL(file);

						},this));

						this.parent.events.canvasDropEvents.push($.proxy(function( event, ui){

							if(!$(event.toElement).hasClass('dropItem')) return;

							var src      = event.toElement.src,
								point    = { x:event.clientX, y:event.clientY },
							    position = this.parent.helpers.getPositionOnCanvas( point );

							img     = new Image();
							img.src = src;
							w       = img.width;
							h       = img.height;

							this.redraw();
							this.parent.history.save();

							this.parent.selecteds = [];

							this.parent.create.box( position.x, position.y, w, h );
							this.parent.selecteds[0].src = src;

							$('.tools .move').click();

							this.parent.render();
							this.parent.draw.ui();
							this.parent.draw.toolbar();

						},this));

					},
					onLoad  : function(){},
					render  : function(){
						
						$('.toolbox.resources .resourceItem').remove();

						for(i in this.parent.resources)
						{
							resource = $.extend(true,{},this.parent.resources[i]);
							flag = false;
							('.resourceItem',this.el).each(function(){
								name = $('.resourceName',this).html();
								if(name==resource.name) flag = true;
							});
							if(flag) continue;
							this.prepend('.body','.resourceItem',resource);
							$('.resourceImage',this.el).attr('src',resource.src);
						};

						if(!$('.resourceItem.selected').length) $('.toolbox.resources .delete').addClass('disabled');

						if(!this.parent.resources.length) 
							$('.toolbox.resources .body').append('<div class="resourceItem noResources">' + getString('NoResources') + '</div>');
					},
					events  : function(){

						$('.resourceItem .resourceDisplay').draggable({ revert: "invalid", revertDuration:10 })

						$('.resourceItem').click(function(){ 
							$(this).toggleClass('selected');
							if($('.resourceItem.selected').length) $('.toolbox.resources .delete').removeClass('disabled');
							else $('.toolbox.resources .delete').addClass('disabled'); 
						});

						$('.toolbox.resources .delete').unbind('click').bind('click',function(){
							$('.resourceItem.selected').each(function(){
								idx = $(this).index();
								editor.resources.splice(idx,1);
							})
							this.redraw();
						});
					}
				});

				$('.toolbox').draggable({ 
					start       : function(){ $(this).css('right','initial'); },
					containment : "window"
				});

				$(document).on('click', '.toolbox .close', function () {
					$(this).parent().hide();
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
					editor.draw.grid.apply(editor);
				});

				$('.toolbox.grid #snap').change(function(){
					editor.grid.snap = $(this).prop('checked');
					editor.draw.grid();
				});

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