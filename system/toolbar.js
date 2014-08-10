
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
			
		}

	}
	
})