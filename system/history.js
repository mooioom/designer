
$.extend( true, editor, {
	
	history : {

		objects   : [],
		selecteds : [],
		index     : 0,
		last      : -1,

		save : function( keepOld )
		{
			var objects     = jQuery.extend(true, [], this.parent.objects ),
				selecteds   = jQuery.extend(true, [], this.parent.selectedObjects ),
				spliceItems = this.objects.length - this.index;

			if(!keepOld) {
				this.objects.splice( this.index, spliceItems );
				this.selecteds.splice( this.index, spliceItems );
				this.last = -1;
			}

			this.objects.push( objects );
			this.selecteds.push( selecteds );
			this.index ++ ;
		},

		undo : function()
		{
			if( this.index == 0 ) return;

			var index 	       = this.index - 1,
				last 		   = this.last,
				item 		   = this.objects[ index ], 
				itemSelecteds  = this.selecteds[ index ],
				historyLength  = this.objects.length - 1,
				historyObjects = this.objects,
				o;

			if( index > last )
			{
				this.last = index;
				this.save( true );
			}

			this.parent.selectedObjects = itemSelecteds;
			if( item ) this.parent.objects = item;

			//todo undo : change prop, add resource, edit text

			this.parent.render();
			this.parent.draw.selectedBox();
			this.parent.draw.selectionBox();
			this.parent.draw.ui();
			this.parent.draw.toolbar();

			this.index = index;

		},

		redo : function()
		{

			if( this.index == this.objects.length - 1 || !this.objects.length ) return;

			var index 		  = this.index + 1,
				item 		  = this.objects[ index ],
				itemSelecteds = this.selecteds[ index ], 
				o;

			this.parent.selectedObjects = itemSelecteds;
			this.parent.objects         = item;

			//todo undo : change prop, add resource, edit text

			this.parent.render();
			this.parent.draw.selectedBox();
			this.parent.draw.selectionBox();
			this.parent.draw.ui();
			this.parent.draw.toolbar();

			this.index ++ ;

		}
	}
	
})