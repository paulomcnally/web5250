/*
 * This is JSON request/response object for 5250 telnet
 * transfered via DWR. To minimize bandwidth as much as possible,
 * field names are replaced with field codes. This way transfer data size
 * is reduced by half.
 * 
 *  For testing with DWR instead of 
 *  [{fieldId:1, value:"QSECOFR"},{fieldId:2, value:"QSECOFR"}]
 *  use
 *  [{e4:1, ea:"QSECOFR"},{e4:2, ea:"QSECOFR"}] 
 */
package ws4is.tn5250;

public class ScreenElement {
	
	//if hidden set field to password
	//if isbypass and ishidden, set style visible=false
	private int isHidden;
	//value of the field or text to be shown inside SPAN
	//if not field, value must be encoded (space to &nbsp; etc....)
	private StringBuffer value;
	//type used to attach appropriate javascript function to field
	//to emulate 5250 behaviour
	private int fieldType;
	//id used to match field to serverside screen buffer
	private int fieldId;
	//attribute used to attach appropriate style to element
	private int attributeId;
	//length of the data of the field (maybe not neded as length value is known )
	private int length;
	//length of the field
	private int maxLength;
	//row of the element
	private int row;
	
	public ScreenElement() {
		value=new StringBuffer();
	}
	
	public void addToValue(final char data){
		if (data <= ' '){
			value.append(' ');	
		}else
		value.append(data);
	}



	public int getE1() {
		return isHidden;
	}

	public void setE1(int isHidden) {
		this.isHidden = isHidden;
	}

	public String getEa() {
		return value.toString();
	}

	public void setEa(final String value) {
		this.value.setLength(0);
		this.value.append(new String(value));
	}

	public int getE3() {
		return fieldType;
	}

	public void setE3(int fieldType) {
		this.fieldType = fieldType;
	}

	public int getE4() {
		return fieldId;
	}
	
	public void setE4(int fieldId) {
		this.fieldId = fieldId;
	}

	public int getE5() {
		return attributeId;
	}

	public void setE5(int attributeId) {
		this.attributeId = attributeId;
	}

	public int getE7() {
		return length;
	}

	public void setE7(int length) {
		this.length = length;
	}

	public int getE8() {
		return maxLength;
	}

	public void setE8(int maxLength) {
		this.maxLength = maxLength;
	}

	public int getE9() {
		return row;
	}

	public void setE9(int row) {
		this.row = row;
	}
		
}
