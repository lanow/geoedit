package main;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;

import org.xml.sax.*;
import org.xml.sax.helpers.DefaultHandler;

/** SaxParser class extends a DefaultHandler, the default base class for SAX2 event handlers.
 * It parses a denkxWeb-xml file (single dataset or whole document) and provides the parsed content
 * for further processing.
 */
public class SaxParser extends DefaultHandler{
	public  String[] args = {"name", "description", "recId", "area", "country", "state", "municipality", "address"};
	public List<Map<String, String>> monumentList = new ArrayList<Map<String, String>>();
	private Map<String, String> monumentMap = new LinkedHashMap<String, String>();
	private boolean name = false;
	private boolean description = false;
	private boolean recId = false;
	private boolean area = false;
	private boolean country = false;
	private boolean state = false;
	private boolean municipality = false;
	private boolean address = false;
	private boolean geometry = false;
	private boolean coordinates = false;
	private String srs = "";
	private String srsGeo = "";
	private String descriptionText = "";
	private int indexCounter = -1;
	private int parseIndex = -1;
	/** The stack to use for orientation.*/
	private final Stack<String> tagsStack = new Stack<String>();
	
	/** The constructor to use for parsing multiple datasets. 
	 */
	SaxParser() {
		parseIndex = -1;
	}
	
	/** The constuctor to use for parsing a singe dataset at a given index position.
	 * 
	 * @param index The index value of the dataset.
	 */
	SaxParser(int index) {
		parseIndex = index;	
	}
	
	
	/** Returns the current monument list.
	 * 
	 * @return The monument list.
	 */
	public List<Map<String, String>> getList() {
		return monumentList;
	}
	
	/** Receive notification of the start of an element. According to the current or local name and the namespace uri
	 * the appropriate private class variable gets manipulated.
	 * 
	 * @param namespaceURI The Namespace URI, or the empty string if the element has no Namespace URI or if Namespace processing is not being performed.
	 * @param localName The local name (without prefix), or the empty string if Namespace processing is not being performed.
	 * @param qName The qualified name (with prefix), or the empty string if qualified names are not available.
	 * @param attrs The attributes attached to the element. If there are no attributes, it shall be an empty Attributes object. 
	 * @throws SAXException
	 */
	@Override
	public void startElement( String namespaceURI, String localName, String qName, Attributes attrs ) throws SAXException
	{ 	
		pushTag(qName);
		if (qName.equals("monument") && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
			indexCounter += 1;
			monumentMap = new LinkedHashMap<String, String>();		
		}	
		if (parseIndex == -1 | (parseIndex == indexCounter)) {
			if (qName.equals(args[0]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				name = true;
			}
			if (qName.equals("p") && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				description = true;
			}
			if (qName.equals(args[2]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				recId = true;
			}
			if (qName.equals(args[3]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				area = true;
			}
			if (qName.equals(args[4]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				country = true;
			}
			if (qName.equals(args[5]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml") ) {
				state = true;
			}
			if (qName.equals(args[6]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				municipality = true;
			}
			if (qName.equals(args[7]) && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				address = true;
			}
			if (qName.equals("geometry") && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				geometry = true;
			} 
			if (qName.equals("geoReference") && namespaceURI.equals("http://www.rjm.de/denkxweb/denkxml")) {
				srsGeo = attrs.getValue("srs");
			}
			if (localName.equals("coordinates") && namespaceURI.equals("http://www.opengis.net/gml/3.2")) {
				coordinates = true;
			}
			if (localName.equals("Point") && namespaceURI.equals("http://www.opengis.net/gml/3.2"))
			{
				srs = attrs.getValue("srsName");
			}	
		}
	  }

	/** Receive notification of the end of an element. With the end of a single monument dataset the tag stack is cleared,
	 *  concluding informations are put to the monumentMap and the monumentMap is added to the monumentList.
	 * 
	 * @param namespaceURI The Namespace URI, or the empty string if the element has no Namespace URI or if Namespace processing is not being performed.
	 * @param localName The local name (without prefix), or the empty string if Namespace processing is not being performed.
	 * @param qName The qualified name (with prefix), or the empty string if qualified names are not available.
	 * @throws SAXException
	 */
	  @Override
	  public void endElement( String namespaceURI, String localName, String qName ) throws SAXException
	  { 
		  if (parseIndex == -1 | (parseIndex == indexCounter)) {  
			  if (qName.equals("monument")) {
				  if (descriptionText != "") {
					  monumentMap.put("description", descriptionText);
					  descriptionText = "";
				  }
				  if (!monumentMap.containsKey("geometry")) {
					  monumentMap.put("hasPoly", "false");
				  }
				  if (!monumentMap.containsKey("coordinates")) {
					  monumentMap.put("hasPoint", "false");
				  } 
				  if (parseIndex != -1) {
					  monumentMap.put("index", "" + parseIndex);
				  }
				  monumentList.add(monumentMap);
				  tagsStack.clear();
			  }
		  }	  
	  }

	  /** Receive notification of character data inside an element. According to the current value of the private class
	   * variables, manipulated in the implemented startElement method, the given characters get assigned and saved in the monumentMap.
	   * 
	   * @param buf The characters.
	   * @param offset The start position in the character array.
	   * @param len The number of characters to use from the character array.
	   * @throws SAXException
	   */
	  @Override
	  public void characters( char[] buf, int offset, int len ) throws SAXException
	  { 
		  if (parseIndex == -1 | (parseIndex == indexCounter)) {
			  if (name) {
				  popTag();
			      String parentTag = peekTag();
			      if (!parentTag.equals("person")) {
			    	  String nameText = new String(buf, offset, len).trim();
			    	  if (nameText.length() > 0) {
			    		  monumentMap.put("name", nameText);
			    	  }
			      }  
				  name = false;
			  }
			  if (description) {
				  descriptionText += "\n" + new String(buf, offset, len);  
				  description = false;
			  }
			  if (recId) {
				  monumentMap.put("recId", new String(buf, offset, len));
				  recId = false;
			  }
			  if (area) {
				  monumentMap.put("area", new String(buf, offset, len));
				  area = false;
			  }
			  if (country)  {
				  monumentMap.put("country", new String(buf, offset, len).toUpperCase());
				  country = false;
			  }
			  if (state) {
				  monumentMap.put("state", new String(buf, offset, len));
				  state = false;
			  }
			  if (municipality) {
				  monumentMap.put("municipality", new String(buf, offset, len));
				  municipality = false;
			  }
			  if (address) {
				  monumentMap.put("adress", new String(buf, offset, len));
				  address = false;
			  }
			  if (geometry) {
				  monumentMap.put("geometry", new String(buf, offset, len));
				  monumentMap.put("hasPoly", "true");
				  geometry = false;
			  }   
			  if (coordinates) {
				  monumentMap.put("coordinates", new String(buf, offset, len).trim());
				  monumentMap.put("hasPoint", "true");
				  coordinates = false;
			  }
			  if (srs != "") {
				  monumentMap.put("srs", srs);
				  srs = "";
			  }
			  if (srsGeo != "") {
				  String[] srsGeoPart = srsGeo.split("/");
				  srsGeo = srsGeoPart[srsGeoPart.length - 1];
				  monumentMap.put("srsGeo", "EPSG:" + srsGeo);
				  srsGeo = "";
			  }
		  }
	 }
	 
	 /** Pushes an empty string tag on the tag stack.
	  */
	  public void startDocument() {
		 pushTag("");
	 }

	 /** Pushes a given string tag on the tag stack.
	  * 
	  * @param tag the string to push on the stack.
	  */
	  private void pushTag(String tag) {
		 tagsStack.push(tag);
	 }

	 /** Removes the string tag at the top of the tag stack and returns it. 
	  * 
	  * @return The removed tag from the top of the stack.
	  */
	  private String popTag() {
		 return tagsStack.pop();  
	 }

	 /** Looks at the string tag at the top of the tag stack without removing it from the stack and returns it.
	  * 
	  * @return The tag at the top of the tag stack.
	  */
	  private String peekTag() {
		 return tagsStack.peek();
	 }
}
