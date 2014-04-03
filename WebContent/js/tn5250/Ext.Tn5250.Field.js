String.prototype.repeat = function(l){
	return new Array(l+1).join(this);
};


Ext.Tn5250.Field = Ext.extend(Ext.Component, {

    initComponent : function(){

		Ext.Tn5250.Field.superclass.initComponent.call(this);
        this.addEvents(
                'focus',
                'blur'
                );        
    },

    onRender : function(ct, position){
        this.screenEl.setObject(this.obj);

        if(!this.el){
        	this.fieldId = this.screenEl.getFieldId();
            this.el = document.createElement('input');
            this.el.setAttribute('name',this.id);
            if (this.screenEl.isHidden()){
                   this.el.setAttribute('type','password');
                   this.el.setAttribute('class','password');
            }else  {
            	this.el.setAttribute('type','text');
                //TODO  based on field type set appropriate class 
                this.el.setAttribute('class','textbox');            	
            }
            this.el.setAttribute('length',this.screenEl.getMaxLength());
            this.el.setAttribute('size',this.screenEl.getLength());
            this.el.setAttribute('maxlength',this.screenEl.getMaxLength());
            this.el.setAttribute('autocomplete','off');
            this.el.setAttribute('autocomplete','off');
            this.el.value = this.screenEl.getValue();
            Ext.Tn5250.Field.superclass.onRender.call(this, ct, position);
        }

    },

     afterRender : function(){
        //Ext.Tn5250.Field.superclass.onRender.call(this);
        this.el.on("focus", this.onFocus,  this);
        
    	this.screenEl.setObject(this.obj);

    	if ( this.screenEl.isNumeric()){
          this.decimal=0; //TODO does have this 
          this.isDecimal = false;
          this.allowDecimal = false;
          this.allowNegative = false;
          this.el.on("blur", this.extractNumber,this);
          this.el.on("keyup", this.extractNumber,this);
          this.el.on("keypress", this.blockNonNumbers,this);
    	};
    	if (this.screenEl.isSignedNumeric()){
          //this.decimal=2;//TODO does have this 
          this.isDecimal = false;
          this.allowDecimal = true;
          this.allowNegative = true;
          this.el.on("blur", this.extractNumber,this);
          this.el.on("keyup", this.extractNumber,this);
          this.el.on("keypress", this.blockNonNumbers,this);
     	};
     	
     	if (this.screenEl.isToUpper()){
     		this.el.on("keyup", this.uppercase,this);
     	}

    },
    
    
    //for rederer to know which field is focused
    onFocus : function(){
      this.fireEvent("focus", this);
    },

    
      getSelectionStart : function(o) {
        	if (o.createTextRange) {
        		var r = document.selection.createRange().duplicate();
        		r.moveEnd('character', o.value.length);
        		if (r.text == '') return o.value.length;
        		return o.value.lastIndexOf(r.text);
        	} else return o.selectionStart;
      },


    processFieldExit : function(){

    	this.screenEl.setObject(this.obj);
        var ml = this.screenEl.getMaxLength();
        var l = this.el.dom.value.length;
        var sel = this.getSelectionStart(this.el.dom);
        //clear if all selected
        if ((sel==0)&&( l>0)) {this.el.dom.value=""; return;};
        if ((l-sel) >0) {
        	this.el.dom.value = this.el.dom.value.substr(0,sel);
        }

        //TODO check field type, according to type do field formatting
        //fill right/left with blank or zeroes
        //this.el.dom.value = " ".repeat(ml-l) + this.el.dom.value;
        //this.el.dom.value =  this.el.dom.value + "0".repeat(ml-l);
        if (this.screenEl.isSignedNumeric() ||  this.screenEl.isNumeric()){
        	if (this.screenEl.isFER()){
        		this.el.dom.value =  this.el.dom.value + "0".repeat(ml-l);
        	}
        	return;
        }

        if (this.screenEl.isToUpper()){this.el.dom.value =  this.el.dom.value.toUpperCase()};
        if (this.screenEl.isFER()){this.el.dom.value = " ".repeat(ml-l) + this.el.dom.value;};

    },

    extractNumber : function (ev,target) {
    	var temp = this.el.dom.value;
    	var decimalPlaces = this.decimal;
        var allowNegative = this.allowNegative;

          this.isDecimal = false;
          this.allowNegative = false;

    	// avoid changing things if already formatted correctly
    	var reg0Str = '[0-9]*';
    	if (decimalPlaces > 0) {
    		reg0Str += '\\.?[0-9]{0,' + decimalPlaces + '}';
    	} else if (decimalPlaces < 0) {
    		reg0Str += '\\.?[0-9]*';
    	}
    	reg0Str = allowNegative ? '^-?' + reg0Str : '^' + reg0Str;
    	reg0Str = reg0Str + '$';
    	var reg0 = new RegExp(reg0Str);
    	if (reg0.test(temp)) return true;
    
    	// first replace all non numbers
    	var reg1Str = '[^0-9' + (decimalPlaces != 0 ? '.' : '') + (allowNegative ? '-' : '') + ']';
    	var reg1 = new RegExp(reg1Str, 'g');
    	temp = temp.replace(reg1, '');
    
    	if (allowNegative) {
    		// replace extra negative
    		var hasNegative = temp.length > 0 && temp.charAt(0) == '-';
    		var reg2 = /-/g;
    		temp = temp.replace(reg2, '');
    		if (hasNegative) temp = '-' + temp;
    	}
    	
    	if (decimalPlaces != 0) {
    		var reg3 = /\./g;
    		var reg3Array = reg3.exec(temp);
    		if (reg3Array != null) {
    			// keep only first occurrence of .
    			//  and the number of places specified by decimalPlaces or the entire string if decimalPlaces < 0
    			var reg3Right = temp.substring(reg3Array.index + reg3Array[0].length);
    			reg3Right = reg3Right.replace(reg3, '');
    			reg3Right = decimalPlaces > 0 ? reg3Right.substring(0, decimalPlaces) : reg3Right;
    			temp = temp.substring(0,reg3Array.index) + '.' + reg3Right;
    		}
    	}

    	this.el.dom.value = temp;
    },
        	
  blockNonNumbers : function (ev,target) {
        var obj  =this.el;
    	var temp = this.el.dom.value;
    	var decimalPlaces = this.decimal;
    	var allowDecimal = this.allowDecimal;
        var allowNegative = this.allowNegative;
        var e = ev;

  	var key;
  	var isCtrl = false;
  	var keychar;
  	var reg;
  		
  	if(window.event) {
  		key = e.keyCode;
  		isCtrl = window.event.ctrlKey
  	}
  	else if(e.which) {
  		key = e.which;
  		isCtrl = e.ctrlKey;
  	}
  	
  	if (isNaN(key)) return true;
  	
  	keychar = String.fromCharCode(key);
  	
  	// check for backspace or delete, or if Ctrl was pressed
  	if (key == 8 || isCtrl)
  	{
  		return true;
  	}
  
  	reg = /\d/;
  	var isFirstN = allowNegative ? keychar == '-' && this.el.dom.value.indexOf('-') == -1 : false;
  	var isFirstD = allowDecimal ? keychar == '.' && this.el.dom.value.indexOf('.') == -1 : false;
  	
  	return isFirstN || isFirstD || reg.test(keychar);
  },    

  uppercase : function (ev,target) {
	  this.el.dom.value = this.el.dom.value.toUpperCase();
  }

});