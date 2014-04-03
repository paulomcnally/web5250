package ws4is.tn5250;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.tn5250j.Session5250;



public class SessionListener implements HttpSessionListener {
	
	private List sessions = null;
	

	public SessionListener() {
		sessions = new Vector();
	}

	public void sessionCreated(HttpSessionEvent arg0) {
		HttpSession sess = arg0.getSession();
		sessions.add(sess);	
		sess.setAttribute(Dwr5250.sessionStore, sessions);
		
	}

	public void sessionDestroyed(HttpSessionEvent arg0) {
		System.out.println("Closing 5250 session as http session is destroyed!");
		HttpSession sess = arg0.getSession();
		sessions.remove(sess);


		HashMap hm = (HashMap)sess.getAttribute(Dwr5250.sessionStore);
                if (hm==null) return;

		Iterator it = hm.values().iterator();
		while (it.hasNext()){
			Session5250 s5250 = (Session5250) it.next();
			try{
				if (s5250.isConnected()) s5250.disconnect();
			}catch(Exception e){};

		}




	}

}
