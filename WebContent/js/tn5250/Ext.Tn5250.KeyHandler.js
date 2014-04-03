//handle active 5250 session , send keystrokes to renderer
Ext.Tn5250.KeyHandler = function(config) {
	config = config || {};
	devName : '';
	Ext.apply(this, config);

	Ext.Tn5250.KeyHandler.superclass.constructor.call(this);
	this.initComponent();
};

Ext.extend( Ext.Tn5250.KeyHandler , Ext.util.Observable, {

	initComponent : function(){

          if ( !Ext.Tn5250.keyManager )
              Ext.Tn5250.keyManager = new Ext.Tn5250.KeyManager();

          Ext.Tn5250.keyManager.register( this );
          this.on( 'documentKeypress', this._keypress );

          //call when panel activated....
          //Ext.Tn5250.keyManager.windowActivate(this);
          
          //used to activate/deactivate key handler
          //handler is overriding every keyboard actions so it is needed to clear handler on exit
          this.renderer.on('show', this._kh_activate,this);
          this.renderer.on('hide', this._kh_deactivate,this);
          this.renderer.on('destroy',this._kh_kill,this);          
          this._kh_activate();
  },

	 _kh_activate : function(){
		if (!Ext.Tn5250.keyManager) return;
		 Ext.Tn5250.keyManager.windowActivate(this);
	 },

	 _kh_deactivate : function(){
		 if (!Ext.Tn5250.keyManager) return;
		 Ext.Tn5250.keyManager.windowDeactivate(this);
	 },

	 _kh_kill : function(){
		 Tn5250Proxy.DeleteSession(this.renderer.devName);
		 if (!Ext.Tn5250.keyManager) return;
		 Ext.Tn5250.keyManager.windowClose(this);
	 },


  _keypress: function(ev) {

          if (!ev)
              ev = window.event;

              var bubble = true;
           //do process
           //  alert('keypress:'+ev.keyCode+' '+ev.which);
           //  alert('modifiers:'+   ev.shiftKey  +' '+  ev.ctrlKey  +' '+  ev.altKey  +' '+ ev.metaKey);
           //Ext.EventObject.F1

           if ((ev.keyCode >= Ext.EventObject.F1) && ((ev.keyCode <= Ext.EventObject.F12))){

                  if(ev.shiftKey) {
                     this.renderer.fireEvent('request', 'PF' + (ev.keyCode-99));
                  } else {
                    this.renderer.fireEvent('request',  'PF' + (ev.keyCode-111));
                  }
                  bubble = false;

           } else if(ev.keyCode == Ext.EventObject.R){
                //Reload screen from cache (clear inputs)
                if(ev.ctrlKey) {
                  this.renderer.fireEvent('remap', ev);
                  bubble = false;
                }
           } else if(ev.keyCode == Ext.EventObject.ENTER){
                  //replace with tab -> go to next field
                  this.renderer.fireEvent('remap', ev);
                  bubble = false;
           } else if(ev.keyCode == Ext.EventObject.UP){
                  //replace with tab -> go to next field
                  this.renderer.fireEvent('remap', ev);
                  bubble = false;
           } else if(ev.keyCode == Ext.EventObject.DOWN){
                  //replace with tab -> go to next field
                  this.renderer.fireEvent('remap', ev);
                  bubble = false;
           } else if(ev.keyCode == Ext.EventObject.PAGEUP){
                  this.renderer.fireEvent('request', 'PGUP');
                  bubble = false;
           } else if(ev.keyCode == Ext.EventObject.PAGEDOWN){
                  this.renderer.fireEvent('request', 'PGDOWN');
                  bubble = false;
           } else if(ev.keyCode == Ext.EventObject.CTRL){

                if(ev.shiftKey) {
                  this.renderer.fireEvent('request', 'Reset');
                } else
                  this.renderer.fireEvent('request', 'Enter');
                  bubble = false;

           } else if(ev.keyCode == Ext.EventObject.ESC){

                 if(ev.shiftKey) {
                     this.renderer.fireEvent('request', 'Attn');
                 }else  this.renderer.fireEvent('request', 'SysReq');
                 bubble = false;
           }

           if(!bubble) {

            ev.cancelBubble=true;
            if (ev.stopPropagation) ev.stopPropagation();
            if (ev.preventDefault)  ev.preventDefault();
            return false;
           }
           return true;

  }

});


Ext.Tn5250.KeyManager = function( config ) {
    config = config || {};
    Ext.apply( this, config );
    this.bypass=false;
    this.initialize( config );
};


Ext.extend( Ext.Tn5250.KeyManager, Ext.util.Observable, {


    initialize: function( config ) {

        this.terms = [];
        this.active = false;
        document.onhelp=function (){return false;};

        if (Ext.isIE){
            document.onkeyup   = this.keyUp.createDelegate( this );
            document.onkeydown = this.keyDown.createDelegate( this );
        } else {
            document.addEventListener('keyup', this.keyUp.createDelegate( this ), true);
            document.addEventListener('keydown', this.keyDown.createDelegate( this ), true);
        };

    },

    keyDown: function( ev ) {
        if ( !this.active )
            return;

        if ( !this.activeWin ) {
            this.active = false;
            return;
        }


        if (Ext.isIE){
              if( Math.abs((window.event.keyCode-18))<3) return false;
        }else{
              if( Math.abs((ev.keyCode-18))<3) return false;
        }

        //return this.activeWin.fireEvent( 'documentKeypress', ev);
        if (this.activeWin.fireEvent( 'documentKeypress', ev)) return true;

		if (Ext.isIE){
			//alert("Internet Explorer");
                        window.event.returnValue=false;
                        if (window.event.keyCode>18) window.event.keyCode=0;
			return false;

			}


    },

    keyUp: function( ev ) {
       var event = null;
       
        if (window.event){
        	event=window.event;
        }else{
          event = ev;
        }

        
    	if ((this.bypass)& (event.keyCode==17)){
            event.cancelBubble=true;
            if (event.stopPropagation) event.stopPropagation();
            if (event.preventDefault)  event.preventDefault();
            this.bypass=false;
    		return false;
    	}
      this.bypass = ((event.ctrlKey) & (event.keyCode!=17)); 
    		
      if( event.keyCode != 17) return true ;
      if(event.altKey) return ;

      
      
        this.activeWin.fireEvent( 'documentKeypress', ev);

    },



    register: function( win ) {
        // where is [].add()?
        for ( var i = 0, len = this.terms.length; i < len; i++ )
            if ( this.terms[ i ] === win )
                return;

        win.addEvents({
            /**
             * @event documentKeypress
             * Fires when a keypress on the document occurs and the window is active
             * @param {Ext.ux.rTerm.Window} this
             * @param {Object} event
             */
            documentKeypress: true
        });
        this.terms.push( win );
        win.on('close',this.windowClose, this );
        win.on('activate',this.windowActivate, this );
        win.on('deactivate',this.windowDeactivate, this );
        //win.on('remove',this.windowClose, this );
        //win.on('show',this.windowActivate, this );
        //win.on('hide',this.windowDeactivate, this );
    },

    windowActivate: function( win ) {
        this.active = true;
        this.activeWin = win;
    },

    windowDeactivate: function( win ) {
        this.active = false;
        this.activeWin = null;
    },

    windowClose: function( win ) {
        this.unregister( win );
    },

    unregister: function( win ) {
        if (( this.activeWin === win )) {
            this.active = false;
            this.activeWin = null;
        }
        this.terms.remove( win );
    }

});