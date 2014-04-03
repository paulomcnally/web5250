
Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';


Ext.onReady(function (){

	var item = new Ext.form.TextField({
        id:"from",
        fieldLabel:"From"}); 
   // var renderer = new Ext.Tn5250.Renderer({devName : 'test', closable: true, disableSelect: true});
	 var renderer = new Ext.Tn5250.Renderer();

var vport = new Ext.Viewport({
     items : renderer, 
     layout: 'fit'
   }).show();


});

