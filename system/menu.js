
$.extend( true, designer, {

	menu : {

		init : function(){

			this.items = [

				{
					id    : 'file',
					sub   : [
						{ id : 'new',       action : this.parent.file.create,  scope : this.parent.file },
						{ id : 'save',      action : this.parent.file.save,    scope : this.parent.file },
						{ id : 'load',      action : this.parent.file.load,    scope : this.parent.file },
						{ id : 'exportHtml',action : this.parent.file.html,    scope : this.parent.file },
						{ id : 'exportSvg', action : this.parent.file.svg,     scope : this.parent.file },
						{ id : 'exportPng', action : this.parent.file.savePng, scope : this.parent.file }
					]
				},
				{
					id    : 'edit',
					sub   : [
						{ id : 'undo'         , action : this.parent.history.undo,           scope : this.parent.history,   shortcut : 'Ctrl + Z' },
						{ id : 'redo'         , action : this.parent.history.redo,           scope : this.parent.history,   shortcut : 'Ctrl + Y' },
						{ id : 'sep' 															                                                  },
						{ id : 'copy'         , action : this.parent.functions.copy,         scope : this.parent.functions, shortcut : 'Ctrl + C' },
						{ id : 'paste'	      , action : this.parent.functions.paste,        scope : this.parent.functions, shortcut : 'Ctrl + V' },
						{ id : 'selectAll'    , action : this.parent.functions.selectAll,    scope : this.parent.functions, shortcut : 'Ctrl + A' },
						{ id : 'delete'	  	  , action : this.parent.functions['delete'],    scope : this.parent.functions, shortcut : 'Del'      },
						{ id : 'sep' 														                                                      },
						{ id : 'transform'    , action : this.parent.functions.transform,    scope : this.parent.functions, shortcut : 'T'        },
						{ id : 'bringToFront' , action : this.parent.functions.bringToFront, scope : this.parent.functions, shortcut : 'Ctrl + F' },
						{ id : 'sendToBack'   , action : this.parent.functions.sendToBack,   scope : this.parent.functions, shortcut : 'Ctrl + B' },
					]
				},
				{
					id    : 'view',
					sub   : [
						{ id : 'grid',      action : this.parent.ui.toolboxs.toggle, args : 'grid',      scope : this.parent.ui.toolboxs, shortcut : 'Ctrl + G' },
						{ id : 'objects',   action : this.parent.ui.toolboxs.toggle, args : 'objects',   scope : this.parent.ui.toolboxs, shortcut : 'Ctrl + O' },
						{ id : 'resources', action : this.parent.ui.toolboxs.toggle, args : 'resources', scope : this.parent.ui.toolboxs, shortcut : 'Ctrl + R' }
					]
				}

			];

			this.render();
			this.events();

		},

		render : function(){

			$('.mainMenu').empty();

			for(i in this.items){

				m   = this.items[i];
				itemEl = $("<div id='"+m.id+"' class='item'>"+getString(m.id)+"</div>");

				if(m.sub && m.sub.length)
				{
					subHolderEl = $("<div class='mainMenuSub'></div>");
					for(x in m.sub)
					{
						sub = m.sub[x];
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
				m = this.items[i];
				this.addEvent( m );
				if(m.sub && m.sub.length)
					for(x in m.sub) this.addEvent( m.sub[x] ); 
			}

		},

		addEvent : function( m ){
			if(!m.action) return;
			this.parent.events.clickEvents.push({
				selector : '.mainMenu #'+m.id,
				action   : m.action,
				args     : m.args,
				scope    : m.scope
			})
			if(m.shortcut)
			{
				this.parent.events.keyboardEvents.push({
					action   : m.action,
					shortcut : m.shortcut.toLowerCase(),
					args     : m.args,
					scope    : m.scope
				});
			}
		}

	}

});