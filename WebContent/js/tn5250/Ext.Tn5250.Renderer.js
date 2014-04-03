

Ext.Tn5250.Renderer = Ext.extend(Ext.form.FormPanel, {

	initComponent : function() {
	
	   var screl = new Ext.Tn5250.ScreenElement();
	   var item = new Ext.Tn5250.Text( {
			obj :{ea :"Connecting..."},
			screenEl : screl
		});

	   
		Ext.apply(this, {
			activeField : null,
			objs : null,
			screenEl : screl
			,items : item
		});
		
		Ext.Tn5250.Renderer.superclass.initComponent.call(this);
		
		this.addEvents(
				/**
				 * @event action Fires when new 5250 keys are pressed, used for sending
				 *        requests to the server
				 * @param {key ,
				 *            event, owner}
				 */
				'request',
				/**
				 * @event action Fires when key remap needed
				 * @param {key ,
				 *            event owner}
				 */
				'remap');
		
				
		// for catching keyboard handler events (remapped keys to commands or
		// rmote requests....)
		this.on('request', this.requestHandler);
		this.on('remap', this.remapHandler);
	
		// set black background
		this.on('render', function() {
			this.body.addClass('container');			
		});
	
		this.initConnection();
		
	},

	exceptionHandler : function(data){
		Ext.MessageBox('Error!',data);
	},
	
	initFirstScreen : function (data){
		if (data) 
		Tn5250Proxy.processRequest([],{devName:this.devName},{ exceptionHandler : this.connectError, callback : this.render5250, scope:this}) ;	 
		
	},
	// called on create object, if devName not set, cretewindow to ask for it
	//
	initConnection : function() {
		if (this.devName != undefined) {
			this.setTitle(this.devName);
			this.handler = new Ext.Tn5250.KeyHandler( {
				renderer :this
			});
			// call initial connection
			Tn5250Proxy.CreateSession(render.devName,{exceptionHandler : this.connectError,callback : this.initFirstScreen, scope:this});		
			return;
		} 
		
		var render = this;	
		Ext.Msg.prompt('Select device name', 'Device Name:', function(btn, text){
		    if (btn == 'ok'){
		    	render.devName=text;
		    	render.setTitle(text);
		    	render.handler = new Ext.Tn5250.KeyHandler( {
					renderer :render
				});

				// call initial connection
		    	Tn5250Proxy.CreateSession(render.devName,{exceptionHandler : this.connectError,callback : render.initFirstScreen, scope:render});
		    	
		    }
		});

	},
	
	disable : function(){
		//Ext.Tn5250.Renderer.superclass.disable.call(this);
		var collection = this.items.filter('id', 'FLD');
		collection.each( function(item, index, length) {
			item.disable();
		});
	},
	
	enable : function(){
		//Ext.Tn5250.Renderer.superclass.enable.call(this);
		var collection = this.items.filter('id', 'FLD');
		collection.each( function(item, index, length) {
			item.enable();
		});
	},	

	// create list of fields and its data , used for sending to server as part
	// of telnet request
	formatJsonReq : function() {
		var collection = this.items.filter('id', 'FLD');
		var fields = new Array(collection.getCount());
		var i=0;
		collection.each( function(item, index, length) {
			fields[i]= {
				e4 :item.fieldId,
				ea :item.el.dom.value
			};
			i++;
		});
		return fields;
	},

	// handle 5250 keys, iterates through fields and creates
	// json object then calls dwr 5250request function
	requestHandler : function(key) {
		if (this.activeField==null) return;
		if (this.disabled) return;
		this.disable();
		var req = {
				devName :this.devName,
				keyRequest :key,
				
				cursorField :this.activeField.fieldId,
				// or
				cursorRow :0
			// TODO add function to Text renderer, on click
					};
			var flds =  this.formatJsonReq();			
		Tn5250Proxy.processRequest(flds, req, { exceptionHandler : this.connectError, callback:this.render5250, scope:this});
	},

	// keyboard commands - field exit, up,down...
	remapHandler : function(event) {

		switch (event.keyCode) {
		case 13:
			return this.doTab();
		case 38:
			return this.prevField();
		case 40:
			return this.nextField();
		case 82:
			return this.render5250(this.objs);
		}
	},

	prevField : function() {
		var comp = this;
		var collection = comp.items.filter('id', 'FLD');
		collection.each( function(item, index, length) {
			if (item.id == comp.activeField.id) {
				if (index > 0) {
					comp.activeField = collection.items[index - 1];
					collection.items[index - 1].focus();
				} else {
					comp.activeField = collection.items[length - 1];
					collection.items[length - 1].focus();
				}
				return false;
			}

		});
	},

	nextField : function() {
		var comp = this;
		var collection = comp.items.filter('id', 'FLD');

		collection.each( function(item, index, length) {
			if (item.id == comp.activeField.id) {
				if (index < length - 1) {
					comp.activeField = collection.items[index + 1];
					collection.items[index + 1].focus();
				} else {
					comp.activeField = collection.items[0];
					collection.items[0].focus();
				}
				return false;
			}

		});
	},

	// proces tab key, find nex and focuse it, if last go to first
	doTab : function() {
		var comp = this;
		var collection = comp.items.filter('id', 'FLD');

		collection.each( function(item, index, length) {
			if (item.id == comp.activeField.id) {
				item.processFieldExit();
				if (index < length - 1) {
					comp.activeField = collection.items[index + 1];
					collection.items[index + 1].focus();
					collection.items[index + 1].el.dom.select();
				} else {
					comp.activeField = collection.items[0];
					collection.items[0].focus();
					collection.items[0].el.dom.select();
				}
				return false;
			}

		});
	},

	// clear 5250 screen data
	clearScreen : function() {
		
		if (Ext.type(this.items) != 'nodelist') return;
		var comp = this;
		this.items.each( function(item, index, length) {
			comp.remove(item);
		});

		this.items.clear();
		// this.comp.doLayout();
	},

	// parse received json stream and create 5250 screen
	render5250 : function(data) {
		
		if (data==undefined) return;
	    if (!Ext.isArray(data)) return;
	    
		this.objs = data;
		this.clearScreen();

		var jsonobj = null;
		var row = 0;
		var elm = null;

		for ( var i = 0, l = this.objs.length; i < l; i++) {
			jsonobj = this.objs[i];
			this.screenEl.setObject(jsonobj);
			if (this.screenEl.getRow() > row) {
				row = this.screenEl.getRow();
				jsonobj.br = true;
			}

			if (this.screenEl.isField()) {
				elm = new Ext.Tn5250.Field( {
					obj :jsonobj,
					screenEl :this.screenEl,
					id :'FLD' + this.screenEl.getFieldId()
				});
			} else
				elm = new Ext.Tn5250.Text( {
					obj :jsonobj,
					screenEl :this.screenEl
				});

			// add focus listener to element
			elm.on('focus', function(o) {this.activeField = o}, this);
			
			// TODO add listener for text also
			// elm.on('click',function(o){ this.getParent().activeField = o.id}, this);
		
			// add element to the screen container (form) and focuse it if needed
			this.add(elm);
			if (this.screenEl.isFocused()) {
				this.activeField = elm;
				elm.focus(false, 300);
			}
		
			}
			
			this.enable();
			this.doLayout();

	},

	// used to disable selection (events : onselectstart - ie, onmousedown -
	// mozilla)
		dummyEvent : function() {
			return false
		}
});


