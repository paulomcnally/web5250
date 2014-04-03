/*
 * This class is used to cast to ScreenElement as
 *  helper to map to shortened method names 
 */
package ws4is.tn5250;

public class Element  {

	ScreenElement sce;
	
	public Element(ScreenElement sce){
		this.sce = sce;
	}
	
	public ScreenElement getElement(){
	 return sce;	
	}
	
	public void setElement(ScreenElement sce){
		this.sce = sce;
	}
	
	
	public int getHidden() {
		return sce.getE1();
	}
	
	public void setHidden(int isHidden) {
		sce.setE1(isHidden);
	}

	public int getFieldType() {
		return sce.getE3();
	}
	
	public void setFieldType(int fieldType) {
		sce.setE3(fieldType);
	}
	
	public int getFieldId() {
		return sce.getE4();
	}
	
	public void setFieldId(int fieldId) {
		sce.setE4(fieldId);
	}
	
	public int getAttributeId() {
		return sce.getE5();
	}
	
	public void setAttributeId(int attributeId) {
		sce.setE5(attributeId);
	}
	
	
	public int getLength() {
		return sce.getE7();
	}
	
	public void setLength(int length) {
		sce.setE7(length);
	}
	
	public int getMaxLength() {
		return sce.getE8();
	}
	
	public void setMaxLength(int maxLength) {
		sce.setE8(maxLength);
	}

	public int getRow() {
		return sce.getE9();
	}

	public void setRow(int row) {
		sce.setE9(row);
	}

	public String getValue() {
		return sce.getEa();
	}
	
	public void setValue(final String value) {
		sce.setEa(value);
	}
	
	public void addToValue(final char value) {
		sce.addToValue(value);
	}
	
}
