
$.extend( true, editor, {

	menu : {

		init : function(){

			this.items = [

				{
					id    : 'file',
					sub   : [
						{ id : 'new',       action : this.parent.file.create,  scope : this.parent.file },
						{ id : 'save',      action : this.parent.file.save,    scope : this.parent.file },
						{ id : 'load',      action : this.parent.file.load,    scope : this.parent.file },
						{ id : 'exportSvg', action : this.parent.file.svg,     scope : this.parent.file },
						{ id : 'exportPng', action : this.parent.file.savePng, scope : this.parent.file }
					]
				},
				{
					id    : 'edit',
					sub   : [
						{ id : 'undo'         , action : this.parent.history.undo,           scope : this.parent.history,   shortcut : 'Ctrl + Z' },
						{ id : 'redo'         , action : this.parent.history.redo,           scope : this.parent.history,   shortcut : 'Ctrl + Y' },
						{ id : 'sep' 															                                                    },
						{ id : 'copy'         , action : this.parent.functions.copy,         scope : this.parent.functions, shortcut : 'Ctrl + C' },
						{ id : 'paste'	      , action : this.parent.functions.paste,        scope : this.parent.functions, shortcut : 'Ctrl + V' },
						{ id : 'selectAll'    , action : this.parent.functions.selectAll,    scope : this.parent.functions, shortcut : 'Ctrl + A' },
						{ id : 'delete'	  	  , action : this.parent.functions.delete,       scope : this.parent.functions, shortcut : 'Del'      },
						{ id : 'sep' 														                                                        },
						{ id : 'bringToFront' , action : this.parent.functions.bringToFront, scope : this.parent.functions, shortcut : 'Ctrl + F' },
						{ id : 'sendToBack'   , action : this.parent.functions.sendToBack,   scope : this.parent.functions, shortcut : 'Ctrl + B' },
					]
				},
				{
					id    : 'view',
					sub   : [
						{ id : 'grid',      action : this.parent.ui.toolbox.toggle, args : 'grid',      scope : this.parent.ui.toolbox, shortcut : 'Ctrl + G' },
						{ id : 'objects',   action : this.parent.ui.toolbox.toggle, args : 'objects',   scope : this.parent.ui.toolbox, shortcut : 'Ctrl + O' },
						{ id : 'resources', action : this.parent.ui.toolbox.toggle, args : 'resources', scope : this.parent.ui.toolbox, shortcut : 'Ctrl + R' }
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
				this.addEvent( item );
				if(item.sub && item.sub.length)
					for(x in item.sub) this.addEvent( item.sub[x] ); 
			}

		},

		addEvent : function( item ){
			if(!item.action) return;
			this.parent.events.clickEvents.push({
				selector : '.mainMenu #'+item.id,
				action   : item.action,
				args     : item.args,
				scope    : item.scope
			})
			if(item.shortcut)
			{
				this.parent.events.keyboardEvents.push({
					action   : item.action,
					shortcut : item.shortcut.toLowerCase(),
					args     : item.args,
					scope    : item.scope
				});
			}
		}

	}

});