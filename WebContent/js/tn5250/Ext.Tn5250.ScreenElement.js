Ext.ns('Ext.Tn5250');

Ext.Tn5250.ScreenElement = function(config) {
	config = config || {};
	Ext.apply(this, config);

	Ext.Tn5250.ScreenElement.superclass.constructor.call(this);
};

Ext.extend(Ext.Tn5250.ScreenElement, Ext.util.Observable, {


  setObject :  function(o) {
	     if((o==undefined) || (o==null)){
	    	 this.o=null;
	     }else   this.o = o;
    },
    
  isBreak :  function() {
    if(this.o && this.o.br) {return this.o.br }
      else return false;
    },


  isField :  function() {
     if(this.o && this.o.e4) {return this.o.e4>0 } 
     else return false;
    },

  isHidden :  function() {
    if(this.o && this.o.e1) {return this.o.e1 } 
      else return false;
    },



  getFieldType :  function() {
    if(this.o && this.o.e3) {return this.o.e3 }
      else return false;
    },

  getFieldId :  function() {
    if(this.o && this.o.e4) {return this.o.e4 }
      else return -1;
    },

  getAttributeId :  function() {
    if(this.o  && this.o.e5) {return this.o.e5 }
      else return -1;
    },


  getLength :  function() {
    if(this.o  && this.o.e7) {return this.o.e7 }
      else return -1;
    },

  getMaxLength :  function() {
    if(this.o  && this.o.e8) {return this.o.e8 }
      else return -1;
    },

  getRow :  function() {
    if(this.o && this.o.e9) {return this.o.e9 }
      else return -1;
    },


  getValue :  function() {
    if(this.o && this.o.ea) {return this.o.ea }
      else return '';
    },

  getClass : function(){

      switch(this.getAttributeId()){
         case -1: return 'green';
         case 32: return 'green';
         case 33: return 'green-rv';
         case 34: return 'white';
         case 35: return 'white-rv';
         case 36: return 'green-ul';
         case 37: return 'green-rv-ul';
         case 38: return 'white-ul';
         case 39: return 'non-disp';
         case 40:
         case 42: return 'red';
         case 41:
         case 43: return 'red-rv';
         case 44:
         case 46: return 'red-ul';
         case 45: return 'red-rv-ul';
         case 47: return 'non-disp';
         case 48: return 'turq-cs';
         case 49: return 'turq-rv';
         case 50: return 'yellow';
         case 51: return 'yellow-rv';
         case 52: return 'turq-ul';
         case 53: return 'turq-rv-ul';
         case 54: return 'yellow-ul';
         case 55: return 'non-disp';
         case 56: return 'pink';
         case 57: return 'pink-rv';
         case 58: return 'blue';
         case 59: return 'blue-rv';
         case 60: return 'pink-ul';
         case 61: return 'pink-rv-ul';
         case 62: return 'blue-ul';
         case 63: return 'non-disp';
         default : return 'green';
       }

   },

   isFocused : function(){
	   var i = this.getFieldType();
	   return (i >>13)&1;
   },
   
    isAutoEnter : function(){
	   var i = this.getFieldType();
	   return (i >>12)&1;
   },
   
    isBypassField : function(){
	   var i = this.getFieldType();	   
	   return (i >>11)&1;
   },
   
    isContinued : function(){
	   var i = this.getFieldType();
	   return (i >>10)&1;
   },
   
    isContinuedFirst : function(){
	   var i = this.getFieldType();
	   return (i >>9)&1;
   },
   
    isContinuedLast : function(){
	   var i = this.getFieldType();
	   return (i >>8)&1;
   },
   
    isContinuedMiddle : function(){
	   var i = this.getFieldType();
	   return (i >>7)&1;
   },
   
    isDupEnabled : function(){
	   var i = this.getFieldType();
	   return (i >>6)&1;
   }, 
   
    isFER : function(){
	   var i = this.getFieldType();
	   return (i >>5)&1;
   },
   
    isHiglightedEntry : function(){
	   var i = this.getFieldType();
	   return (i >>4)&1;
   },
   
    isMandatoryEnter : function(){
	   var i = this.getFieldType();
	   return (i >>3)&1;   
   },
   
    isNumeric : function(){
	   var i = this.getFieldType();
	   return (i >>2)&1;
   },
   
    isSignedNumeric : function(){
	   var i = this.getFieldType();
	   return (i>>1)&1;  
   },
   
    isToUpper : function(){
	   var i = this.getFieldType();
	   return (i&1);
   }
     
});

