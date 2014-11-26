
$.extend( true, designer, {
	
	history : {

		objects         : [],
		selecteds       : [],
		groups          : [],
		selectedsGroups : [],

		index     : 0,
		last      : -1,

		save : function( keepOld )
		{
			var objects     	= jQuery.extend(true, [], this.parent.objects ),
				selecteds   	= jQuery.extend(true, [], this.parent.selectedObjects ),
				groups      	= jQuery.extend(true, [], this.parent.groups ),
				selectedsGroups = jQuery.extend(true, [], this.parent.selectedsGroups ),
				spliceItems = this.objects.length - this.index;

			if(!keepOld) {
				this.objects.splice( this.index, spliceItems );
				this.selecteds.splice( this.index, spliceItems );
				this.last = -1;
			}

			this.objects.push( objects );
			this.selecteds.push( selecteds );
			this.groups.push( groups );
			this.selectedsGroups.push( selectedsGroups );
			this.index ++ ;
		},

		undo : function()
		{
			if( this.index == 0 ) return;

			var index 	        = this.index - 1,
				last 		    = this.last,
			   	objects 	    = this.objects[ index ], 
				selecteds       = this.selecteds[ index ],
				groups 	        = this.groups[ index ], 
				selectedsGroups = this.selectedsGroups[ index ];

			if( index > last )
			{
				this.last = index;
				this.save( true );
			}

			this.parent.selectedObjects = selecteds;
			if( objects ) 		  this.parent.objects = objects;
			if( groups ) 		  this.parent.groups = groups;
			if( selectedsGroups ) this.parent.selectedsGroups = selectedsGroups;

			//todo undo : change prop, add resource, edit text

			this.parent.selecteds = [];
			this.parent.redraw();
			this.index = index;

		},

		redo : function()
		{

			if( this.index == this.objects.length - 1 || !this.objects.length ) return;

			var index 		      = this.index + 1,
				objects 		  = this.objects[ index ],
				itemSelecteds 	  = this.selecteds[ index ],
				groups 	       	  = this.groups[ index ], 
				selectedsGroups   = this.selectedsGroups[ index ];

			this.parent.selectedObjects = itemSelecteds;
			if( objects ) 		  this.parent.objects = objects;
			if( groups ) 		  this.parent.groups = groups;
			if( selectedsGroups ) this.parent.selectedsGroups = selectedsGroups;

			//todo undo : change prop, add resource, edit text

			this.parent.selecteds = [];
			this.parent.redraw();

			this.index ++ ;

		}
	}
	
})