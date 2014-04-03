/*
 * This is main 5250 Telnet WebProxy class.
 */
package ws4is.tn5250;

import java.util.HashMap;
import java.util.List;
import java.util.Vector;

import javax.servlet.http.HttpSession;
import org.directwebremoting.WebContextFactory;
import org.tn5250j.Session5250;
import org.tn5250j.TN5250jConstants;
import org.tn5250j.beans.ProtocolBean;
import org.tn5250j.framework.tn5250.Screen5250;
import org.tn5250j.framework.tn5250.ScreenField;
import org.tn5250j.framework.tn5250.ScreenOIA;


public class Dwr5250 {

	public static String sessionStore = "tn5250";
	//default host name 
	private String hostName;
	
	public Dwr5250(String hostName) {	
		this.hostName = hostName;
	}

	//Create new telnet session by devicename as device name is unique
	//If session already exists, does nothing - return true 
	public boolean CreateSession(String devName){	
		devName = devName.toUpperCase();
		HttpSession session = WebContextFactory.get().getSession();
		HashMap hm = getSessionStore(session);

		
		if((devName==null) | (devName.length()==0)){
			//TODO ??? generate session id ???
		}
		
		Session5250 sess = (Session5250)hm.get(devName);
		if(sess!=null) return true;
		
		try{
			ProtocolBean pb  = getProtocol(session,devName);
			sess = pb.getSession();
			pb.connect();
			hm.put(devName.toUpperCase(), sess);
			while (!sess.isConnected()){
				Thread.sleep(2000);	
			}				
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}
		
		
		return true;
	}
	
	//remove TNSession from HTTPSession
	public boolean DeleteSession(String devName){
		devName = devName.toUpperCase();
		try{
			HttpSession session = WebContextFactory.get().getSession();

			HashMap hm = getSessionStore(session);
			Session5250 sess = (Session5250)hm.get(devName);
			sess.disconnect();
			hm.remove(devName);			
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	
	//response/request for 5250 active session List<ScreenElement>
	public ScreenElement[] processRequest(ScreenElement[] fields, Request request)throws Exception{
		
		HttpSession httpsession = WebContextFactory.get().getSession();
		Session5250 session = getTnSession(httpsession,request.getDevName());
		
		if (!session.isConnected()) throw new Exception("Not connected!");
		
		
		try{
			if (requestProxy(session,request,fields)){
				List list = getResponse(session);
				ScreenElement[] result = (ScreenElement[])list.toArray(new ScreenElement[0]); 
				return result;
			}else return null;
			
		}catch(Exception e){
			e.printStackTrace();
			return null;
		}
				
	}
	
	/*************** PRIVATE MEMBERS *********************/
	private Session5250 getTnSession(HttpSession session, String devName){
		HashMap hm = getSessionStore(session);
		return (Session5250)hm.get(devName);		
	}
	
	
	private String getHost(HttpSession session){
		return this.hostName;
	}
	
	private HashMap getSessionStore(HttpSession session){
		HashMap hm  = (HashMap)session.getAttribute(Dwr5250.sessionStore);
		if (hm==null) {
			hm = new HashMap();
			session.setAttribute(Dwr5250.sessionStore, hm);
		}
				
		return hm;
	}
	
	private ProtocolBean getProtocol(HttpSession session, String devName){

		ProtocolBean pb = new ProtocolBean("test", devName);
        try {
           pb.setHostName(getHost(session));
           pb.setScreenSize("27x132");
           if (devName!=null)
           pb.setDeviceName(devName);
        }
        catch (java.net.UnknownHostException e) {}
        return pb;
	}
	
	/*******************REQUEST PROCESSOR***********************/
	
	//forward request from web to host and waits for return
	//after response, screen will be reloaded
	//TODO - handle session hang & timeout so not to continue
	private boolean requestProxy(Session5250 session, Request request,ScreenElement[] fields){

		Screen5250 screen= session.getScreen();
		
        boolean sendIt = false;

	    //Parameter PF set in javascript by key press
	    String aidS = request.getKeyRequest();
	    if (aidS != null && aidS.length() > 0) {
	            sendIt = true;
	    }


        if (aidS != null && aidS.length() > 0) {
            aidS = "[" + aidS.toLowerCase() + "]";
        }else {
	        aidS = "[enter]";
	    }   	 
       
        
        	int fl = fields.length;
        	Element element = new Element(null);
        	 for (int x = 0; x < fl; x++) {
        		element.setElement((ScreenElement)fields[x]);        		 
	            String field = element.getValue();
	            if (field != null && field.length() > 0) {
	               sendIt = true;	               
	               ScreenField sf = screen.getScreenFields().getField(element.getFieldId()-1);
	               screen.setCursor(sf.startRow(), sf.startCol());
	               sf.setString(field);
	               //System.out.println("FLD" + (x + 1) + "-> " + field + " -> " + sf.getString());
	            }
	            
	         }

	         int prow = request.getCursorRow();
	         if (prow > 0) {
	        	 screen.setCursor( prow , 5);
	         } else if (request.getCursorField() > 0) {
	        	  int i = request.getCursorField()-1;
	        	  if (i<1){
	        		  screen.gotoField(screen.getScreenFields().getSize());
	        	  }else screen.gotoField(i);
	               //screen.gotoField(request.getCursorField());
	         }

	         if (sendIt || screen.getScreenFields().getFieldCount() == 0) {
	            screen.sendKeys(aidS);
	            while (screen.getOIA().getInputInhibited() == ScreenOIA.INPUTINHIBITED_SYSTEM_WAIT
	                  && screen.getOIA().getLevel() != ScreenOIA.OIA_LEVEL_INPUT_ERROR) {
	               try {
	                  Thread.currentThread().sleep(300);
	               }
	               catch (InterruptedException ex) {
	                  ;
	               }
	            }
	         }

	   return true;
	}

	/*******************RESPONSE PROCESSOR***********************/
	
	private List getResponse(Session5250 session){
		  List  list =new Vector();
		  Screen5250 screen = session.getScreen();
		  int focusfield = getFocusField(screen);
          int numRows = screen.getRows();
          int numCols = screen.getColumns();
          int lenScreen = screen.getScreenLength();
          int lastAttr = 32;
          int pos = 0;
          int row = 0;
          int col = 0;
          boolean changeAttr = false;
          Element element= new Element(new ScreenElement());
          list.add(element.getElement());

          Data screenRect = new Data(1, 1, numRows, numCols, screen);         

	         while (pos < lenScreen) {

	            // check for the changing of the text color attributes.
	            if (screenRect.attr[pos] != lastAttr) {
	            	//if (! changeAttr) new ScreenElement ???????           		
	               if (pos < lenScreen - 1 && screenRect.field[pos + 1] == 0) {
	                  // close the previous
	                  changeAttr = true;
	               }
	               lastAttr = screenRect.attr[pos];	               
	            }

	            if (screenRect.field[pos] != 0) {
	               ScreenField sf = screen.getScreenFields().findByPosition(pos);
	               if (sf != null) {
	                  if (sf.startPos() == pos) {
	                	  
		                 element.setElement(new ScreenElement()); 
		                 list.add(element.getElement());  
	                	  
	                     if ((screenRect.extended[pos] & TN5250jConstants.EXTENDED_5250_NON_DSP) != 0)
	                    	 element.setHidden(1);

	                     if (sf.isBypassField()) {
	                        if ((int) screenRect.attr[pos] == 39) {
	                        	element.setHidden(1);
	                        }
	                     }

	                     // if the field will extend past the screen column size
	                     //  we will just truncate it to be the size of the rest
	                     //  of the screen.
	                     int len = sf.getLength();
	                     if (col + len > numCols){
	                    	  len = numCols - col;
	                    	  row++;
	                     }	                      

	                     // get the field contents and only trim the non numeric
	                     //   fields so that the numeric fields show up with
	                     //   the correct alignment within the field.
	                     String value = "";	    
	                     if (sf.isNumeric() || sf.isSignedNumeric()){
	                    	 value = sf.getString();
	                     } else 
	                    	 value = RTrim(sf.getString());
                         
                         
	                     int i=0;	 
	                     i = i | ((focusfield == sf.getFieldId())? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isAutoEnter() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isBypassField() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isContinued() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isContinuedFirst() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isContinuedLast() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isContinuedMiddle() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isDupEnabled() ? 1 : 0);
	                     i = i << 1;	                     
	                     i = i | ( sf.isFER() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isHiglightedEntry() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isMandatoryEnter() ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isNumeric()  ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isSignedNumeric()  ? 1 : 0);
	                     i = i << 1;
	                     i = i | ( sf.isToUpper()   ? 1 : 0);
	                     	                     
	                     element.setFieldType(i); 
	                     element.setFieldId(sf.getFieldId());
	                     element.setLength(len);
	                     element.setMaxLength(sf.getFieldLength());
	                     element.setValue(value);
	                     changeAttr = true;
	                  }
	               }
	            }
	            else {
	               element.addToValue(screenRect.text[pos]);  
	            }

	            if (changeAttr) {
	                 element.setElement(new ScreenElement()); 
	                 list.add(element.getElement());  
	            	element.setValue("");
	            	element.setFieldId(0); //not a field
	            	element.setAttributeId(lastAttr);
	                element.setRow(row);
	                changeAttr = false;
	            }

	            if (++col == numCols) {
	               col = 0;
	               row++;
	                 element.setElement(new ScreenElement()); 
	                 list.add(element.getElement());  
	            	element.setFieldId(0); //not a field
	            	element.setAttributeId(lastAttr);
	                element.setRow(row);
	                element.setValue("");
	               
	            }
	            pos++;
	         }		
	         return list;
	}
	
	private int getFocusField(Screen5250 screen){

		ScreenField focusField = screen.getScreenFields().getCurrentField();

        if (focusField == null)
        	focusField = screen.getScreenFields().getFirstInputField();

        if (focusField != null){
        	return focusField.getFieldId();
        } else return -1;
       	  
	}
	
	   private StringBuffer valueBuffer = new StringBuffer(5);

	   private String RTrim(String text) {

	      valueBuffer.setLength(0);

	      // Here we are going to perform a trim of only the trailing
	      //   white space.
	      valueBuffer.append(text);
	      int len2 = valueBuffer.length();

	      while ((len2 > 0) && (valueBuffer.charAt(len2-1) <= ' ')) {

	         len2--;
	      }
	      valueBuffer.setLength(len2);
	      return valueBuffer.toString();
	   }
	   
}
