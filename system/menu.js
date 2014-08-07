
$.extend( true, editor, {

	menu : {

		init : function(){

			this.parent = editor;

			this.items = [

				{
					id    : 'file',
					sub   : [
						{ id : 'new',       action : editor.create    },
						{ id : 'save',      action : editor.save      },
						{ id : 'load',      action : editor.load      },
						{ id : 'exportSvg', action : editor.svg       },
						{ id : 'exportPng', action : editor.saveImg   }
					]
				},
				{
					id    : 'edit',
					sub   : [
						{ id : 'undo'         , action : editor.undo, 		   shortcut : 'Ctrl + Z' },
						{ id : 'redo'         , action : editor.redo, 		   shortcut : 'Ctrl + Y' },
						{ id : 'sep' 															     },
						{ id : 'copy'         , action : editor.copy, 		   shortcut : 'Ctrl + C' },
						{ id : 'paste'	      , action : editor.paste, 		   shortcut : 'Ctrl + V' },
						{ id : 'selectAll'    , action : editor.selectAll, 	   shortcut : 'Ctrl + A' },
						{ id : 'delete'	  	  , action : editor.deleteCurrent, shortcut : 'Del'      },
						{ id : 'sep' 														         },
						{ id : 'bringToFront' , action : editor.bringToFront,  shortcut : 'Ctrl + F' },
						{ id : 'sendToBack'   , action : editor.sendToBack,    shortcut : 'Ctrl + B' },
					]
				},
				{
					id    : 'view',
					sub   : [
						{ id : 'grid',      action : this.toolbox('grid'),      shortcut : 'Ctrl + G' },
						{ id : 'objects',   action : this.toolbox('objects'),   shortcut : 'Ctrl + O' },
						{ id : 'resources', action : this.toolbox('resources'), shortcut : 'Ctrl + R' }
					]
				}

			];

			console.log('menuInit',this,this.parent);

			this.render();
			this.events();

		},

		render : function(){

			$('.mainMenu').empty();

			for(i in this.items){

				item   = this.items[i];
				itemEl = $("<div id='"+item.id+"' class='item'>"+getString(item.id)+"</div>");

				if(item.sub && item.sub.length)
				{
					subHolderEl = $("<div class='mainMenuSub'></div>");
					for(x in item.sub)
					{
						sub = item.sub[x];
						if(sub.shortcut) shortcut = sub.shortcut; else shortcut = '';
						if(sub.id == 'sep'){ subHolderEl.append("<div class='subItemSep'></div>"); continue; }
						subEl 		  = $("<div id='"+sub.id+"' class='subItem'></div>");
						subTitleEl 	  = $("<div class='title'>"+getString(sub.id)+"</div>");
						subshortcutEl = $("<div class='shortcut'>"+shortcut+"</div>");
						subEl.append(subTitleEl);
						subEl.append(subshortcutEl);
						subEl.append("<div class='clear'></div>");
						subHolderEl.append(subEl);
					}
					itemEl.append(subHolderEl);
				}
				$('.mainMenu').append( itemEl );
			}
			$('.mainMenu').append( "<div class='clear'></div>" );
		},

		events : function(){

			for(i in this.items)
			{
				item = this.items[i];
				this.initEventForItem( item );
				if(item.sub && item.sub.length)
					for(x in item.sub) this.initEventForItem( item.sub[x] ); 
			}

		},

		initEventForItem : function( item ){
			if(!item.action) return;
			$('.mainMenu #'+item.id).unbind('click').click( $.proxy( item.action, this.parent ) );
		},

		toolbox : function(){

		}

	}

});