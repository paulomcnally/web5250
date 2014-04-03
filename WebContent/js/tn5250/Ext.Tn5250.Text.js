//assign json object, and pass Renderer.ScreenElement

Ext.Tn5250.Text = Ext.extend(Ext.BoxComponent, {

    onRender : function(ct, position){

        this.screenEl.setObject(this.obj);

        if(!this.el){
            this.el = document.createElement('span');
            this.el.setAttribute('row',this.screenEl.getRow());

            if (!this.screenEl.isHidden()){            	
            	this.el.setAttribute('class',this.screenEl.getClass());
            }
            if(this.screenEl.isBreak()){
              this.el.innerHTML = '<br>' + this.htmlEncode(Ext.util.Format.htmlEncode(this.screenEl.getValue()));
            }else
              this.el.innerHTML = this.htmlEncode(Ext.util.Format.htmlEncode(this.screenEl.getValue()));
        }
        Ext.Tn5250.Text.superclass.onRender.call(this, ct, position);
    },

     htmlEncode : function(value){
              return !value ? value : String(value).replace(/ /g,'&nbsp;');
        }


});

