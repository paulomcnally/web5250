package ws4is.tn5250;

public class Request {

	private String keyRequest;
	private int cursorField; 
	private int cursorRow;
	private String devName;
	
	public String getKeyRequest() {
		return keyRequest;
	}
	public void setKeyRequest(String keyRequest) {
		this.keyRequest = keyRequest;
	}
	public int getCursorField() {
		return cursorField;
	}
	public void setCursorField(int cursorField) {
		this.cursorField = cursorField;
	}
	public int getCursorRow() {
		return cursorRow;
	}
	public void setCursorRow(int cursorRow) {
		this.cursorRow = cursorRow;
	}
	public String getDevName() {
		return devName;
	}
	public void setDevName(String devName) {
		this.devName = devName.toUpperCase();
	}
	
}
