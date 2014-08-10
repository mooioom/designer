
$.extend( true, editor, {

	menu : {

		init : function(){

			this.items = [

				{
					id    : 'file',
					sub   : [
						{ id : 'new',       action : this.parent.create    },
						{ id : 'save',      action : this.parent.save      },
						{ id : 'load',      action : this.parent.load      },
						{ id : 'exportSvg', action : this.parent.svg       },
						{ id : 'exportPng', action : this.parent.saveImg   }
					]
				},
				{
					id    : 'edit',
					sub   : [
						{ id : 'undo'         , action : this.parent.undo, 		    shortcut : 'Ctrl + Z' },
						{ id : 'redo'         , action : this.parent.redo, 		    shortcut : 'Ctrl + Y' },
						{ id : 'sep' 															          },
						{ id : 'copy'         , action : this.parent.copy, 		    shortcut : 'Ctrl + C' },
						{ id : 'paste'	      , action : this.parent.paste, 		shortcut : 'Ctrl + V' },
						{ id : 'selectAll'    , action : this.parent.selectAll, 	shortcut : 'Ctrl + A' },
						{ id : 'delete'	  	  , action : this.parent.deleteCurrent, shortcut : 'Del'      },
						{ id : 'sep' 														              },
						{ id : 'bringToFront' , action : this.parent.bringToFront,  shortcut : 'Ctrl + F' },
						{ id : 'sendToBack'   , action : this.parent.sendToBack,    shortcut : 'Ctrl + B' },
					]
				},
				{
					id    : 'view',
					sub   : [
						{ id : 'grid',      action : this.parent.toolbox, args : ['grid'],      shortcut : 'Ctrl + G' },
						{ id : 'objects',   action : this.parent.toolbox, args : ['objects'],   shortcut : 'Ctrl + O' },
						{ id : 'resources', action : this.parent.toolbox, args : ['resources'], shortcut : 'Ctrl + R' }
					]
				}

			];

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
			if(item.shortcut)
			{
				this.parent.events.keyboardEvents.push({
					action   : item.action,
					shortcut : item.shortcut,
					args     : item.args
				});
			}
		}

	}

});