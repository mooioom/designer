
$.extend( true, editor, {
	
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
				editor['align'+type]();
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

	}
	
})