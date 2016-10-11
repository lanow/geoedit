package main;

import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.*;
import org.w3c.dom.*;
import org.xml.sax.*;
import main.SaxParser;

import com.google.gson.Gson;
import com.sun.org.apache.xml.internal.serializer.OutputPropertiesFactory;

/** Servlet implementation class XMLParseServlet to parse and edit a denkXWeb-XML file.
 * For parsing a SAX parser is used. For editing a DOM parser is used.
 */
public class XMLParseServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
    
	/** Constructor of the XMLParseServlet
     * @see HttpServlet#HttpServlet()
     */
    public XMLParseServlet() {
        super();
    }

	/** Serves a HTTP GET request for the paths "/parse", "/edit" and "/remove".
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	try {	
			if (request.getServletPath().equals("/parse")) {
				SaxParser handler = new SaxParser();
				SAXParserFactory factory = SAXParserFactory.newInstance();
				factory.setNamespaceAware(true);
				SAXParser parser = factory.newSAXParser();
				parser.parse( new File(getServletContext().getInitParameter("file.location") + "GeoEdit/" + request.getParameter("file")), handler);		       
			    List<Map<String, String>> parseResult = handler.getList();			    
			    String json = new Gson().toJson(parseResult);
				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().write(json);	
			} else {
			
				DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
				DocumentBuilder builder = null;
				try {
					builder = factory.newDocumentBuilder();
				} catch (ParserConfigurationException e) {
					e.printStackTrace();
				}
				Document document = builder.parse( new File(getServletContext().getInitParameter("file.location") + "GeoEdit/" + request.getParameter("file")));
				XPathFactory xFactory = XPathFactory.newInstance();
				XPath xpath = xFactory.newXPath();
				if (request.getServletPath().equals("/edit")) {
					editRecord(request, response, document, xpath);
				}
				if (request.getServletPath().equals("/remove")) {
					removeGeoReference(request, response, document, xpath);
				}
			}	
		} catch (XPathExpressionException e) {
			e.printStackTrace();
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (TransformerException e) {
			e.printStackTrace();
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		}
	}

	/** Serves a HTTP POST request by calling the implemented doGet method.
	 *
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
    @Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);	
	}
	
	/** Checks, if the given NodeList contains a georeference node. If a georeference node is found it is returned. 
	 * Otherwise null is returned.
	 * 
	 * @param xpath An instance of an XPath to evaluate an XPath expression.
	 * @param item The NodeList to search through.
	 * @return The found gereference node or null.
	 */
	private Node getGeoReference(XPath xpath, NodeList item){
		Node geo = null;
		try {		
			geo = (Node) xpath.evaluate("geoReference", item, XPathConstants.NODE);
		}
		catch (NullPointerException npe){
			npe.printStackTrace();
		} catch (XPathExpressionException xe) {
			xe.printStackTrace();
		}
		return geo;
	}
	
	/** Checks, if the given node contains a position node. If a position node is found it is returned.
	 * Otherwise null is returned.
	 * 
	 * @param xpath An instance of an XPath to evaluate an XPath expression.
	 * @param geo The Node to search through.
	 * @return The found position node or null.
	 */
	private Node getPosition(XPath xpath, Node geo){
		Node position = null;
		try {
			position = (Node) xpath.evaluate("position", geo, XPathConstants.NODE);
		}
		catch (NullPointerException e){
			e.printStackTrace();
		} catch (XPathExpressionException e) {
			e.printStackTrace();
		}
		return position;
	}
	
	/**Checks, if the given node contains a geometry node. If a geometry node is found it is returned.
	 * Otherwise null is returned.
	 * 
	 * @param xpath An instance of an XPath to evaluate an XPath expression.
	 * @param geo The Node to search through.
	 * @return The found geometry node or null.
	 */
	private String getGeometry(XPath xpath, Node geo){
		String geometry = null;
		try {
			geometry = (String) xpath.evaluate("geometry", geo, XPathConstants.STRING);
		}
		catch (NullPointerException e){
			e.printStackTrace();
		} catch (XPathExpressionException e) {
			e.printStackTrace();
		}
		return geometry;
	}
	
	/** Removes whitespace in the given node to keep a pretty structure.
	 * 
	 * @param parentNode The node to clean.
	 */
	public void removeWhitespaces(Node parentNode) {
	    if (parentNode != null) {
	        NodeList children = parentNode.getChildNodes();
	        if (children != null && children.getLength() > 0) {
	            ArrayList<Node> removeNodeList = new ArrayList<Node>();
	            for (int i = 0; i < children.getLength(); i++) {
	                Node child = children.item(i);
	                if (child.getNodeType() == Node.TEXT_NODE) {
	                    if (child.getTextContent() == null
	                            || "".equals(child.getTextContent().trim()))
	                        removeNodeList.add(child);
	                } else
	                    removeWhitespaces(child);
	            }
	            for (Node nodeToRemove : removeNodeList) {
	                parentNode.removeChild(nodeToRemove);
	            }
	        }
	    }
	}
	
	/** Removes the georeference of a record within a given document, according to the given request parameter
	 * 'overwrite' (boolean value to indicate, if overwriting is allowed), 'index' (the record to edit) and
	 * 'file' (the destination file).
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param document The content to change.
	 * @param xpath An instance of an XPath to evaluate an XPath expression.
	 * @throws XPathExpressionException
	 * @throws IOException
	 * @throws SAXException
	 * @throws ParserConfigurationException
	 */
	private void removeGeoReference(HttpServletRequest request, HttpServletResponse response, Document document, XPath xpath) throws XPathExpressionException, IOException, SAXException, ParserConfigurationException {
		String overwrite = request.getParameter("overwrite");		
		Map<String, String> monumentMap = new LinkedHashMap<String, String>();
		int index = Integer.parseInt(request.getParameter("index"));
		NodeList monuments = document.getElementsByTagName("monument");
		NodeList singleMonument = monuments.item(index).getChildNodes();
		Node geoReference = getGeoReference(xpath, singleMonument);
		Node parent = geoReference.getParentNode();
		if (overwrite.equals("true")) {	
			parent.removeChild(geoReference);
			removeWhitespaces(parent);
		}
		document.normalizeDocument();
		updateFile(request, document);
		SaxParser handler = new SaxParser(index);
		SAXParserFactory factory = SAXParserFactory.newInstance();
		factory.setNamespaceAware(true);
		SAXParser parser = factory.newSAXParser();
		parser.parse( new File(getServletContext().getInitParameter("file.location") + "GeoEdit/" + request.getParameter("file")), handler);		    	    
	    List<Map<String, String>> parseResult = handler.getList();
	    monumentMap = parseResult.get(0);
		String json = new Gson().toJson(monumentMap);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);	
	}
	
	/** Edits a record of a given document according to the given request parameter 'index' (the record to edit),
	 * 'geometry' (the geometry to set), 'overwrite' (boolean value to indicate, if overwriting is allowed), 
	 * 'point' (the point coordinates to set), 'file' (the destination file). 
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param document The content to edit.
	 * @param xpath An instance of an XPath to evaluate an XPath expression.
	 * @throws TransformerException 
	 * @throws IOException
	 * @throws XPathExpressionException
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 */
	private void editRecord(HttpServletRequest request, HttpServletResponse response, Document document, XPath xpath) throws TransformerException, IOException, XPathExpressionException, ParserConfigurationException, SAXException {
		Map<String, String> monumentMap = new LinkedHashMap<String, String>();
		int index = Integer.parseInt(request.getParameter("index"));
		String polygon = request.getParameter("geometry");
		String overwrite = request.getParameter("overwrite");	
		String point = request.getParameter("point");		
		if (point != null | polygon != null) {
			NodeList monuments = document.getElementsByTagName("monument");
			NodeList singleMonument = monuments.item(index).getChildNodes();			
			Node geo = getGeoReference(xpath, singleMonument);
			if (geo == null) {		
				Element geoReference = document.createElement("geoReference");
				geoReference.setAttribute("srs", "http://www.spatialreference.org/ref/epsg/4326/");
				Element closingElement = (Element) singleMonument.item(singleMonument.getLength() - 2);
				Node parent = closingElement.getParentNode();
				if (closingElement.getTagName().equals("recCopyright")) {
					parent.insertBefore(geoReference, closingElement);
				} else{
					monuments.item(index).appendChild(geoReference);
				}
				geo = geoReference;
			}
			if (point != null) {
				if (getPosition(xpath, geo) == null){
					Element position = document.createElement("position");
					Element gmlPoint = document.createElementNS("http://www.opengis.net/gml/3.2", "gml:Point");
					gmlPoint.setAttribute("srsName", "EPSG:4326");
					Element coordinates = document.createElementNS("http://www.opengis.net/gml/3.2", "gml:coordinates");
					coordinates.setTextContent(point);
					gmlPoint.appendChild(coordinates);
					position.appendChild(gmlPoint);
					NodeList geoChildren = geo.getChildNodes();
					if (geoChildren.getLength() > 0) {
						geo.insertBefore(position, geoChildren.item(geoChildren.getLength() - 2));
					} else {
						geo.appendChild(position);
					}
				} else if (overwrite.equals("true")){
					Element gmlPoint = (Element) xpath.evaluate("position//*[local-name()='Point']", geo, XPathConstants.NODE);
					gmlPoint.setAttribute("srsName", "EPSG:4326");
					Element coordinates = (Element) xpath.evaluate("position//*[local-name()='Point']//*[local-name()='coordinates']", geo, XPathConstants.NODE);
					coordinates.setTextContent(point);
				}			
			}
			if (polygon != null) {
				if (getGeometry(xpath, geo) == "") {
					Element geometry = document.createElement("geometry");
					geometry.setTextContent(polygon);
					geo.appendChild(geometry);				
				} else if (overwrite.equals("true")) {
					Element geoReference = (Element) xpath.evaluate("geoReference", singleMonument, XPathConstants.NODE);
					geoReference.setAttribute("srs", "http://www.spatialreference.org/ref/epsg/4326/");
					Element geometry = (Element) xpath.evaluate("geoReference/geometry", singleMonument, XPathConstants.NODE);
					geometry.setTextContent(polygon);
				}		
			}
			updateFile(request, document);
		}
		SaxParser handler = new SaxParser(index);
		SAXParserFactory factory = SAXParserFactory.newInstance();
		factory.setNamespaceAware(true);
		SAXParser parser = factory.newSAXParser();
		parser.parse( new File(getServletContext().getInitParameter("file.location") + "GeoEdit/" + request.getParameter("file")), handler);		        
	    List<Map<String, String>> parseResult = handler.getList();
	    monumentMap = parseResult.get(0);
	    monumentMap.put("changed", overwrite);
		String json = new Gson().toJson(monumentMap);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);				
	}
	
	/** Updates a file, given as request parameter, with the content of the given document.
	 * 
	 * @param request The request with the parameter 'file' to update.
	 * @param document The content to set.
	 */
	private void updateFile(HttpServletRequest request, Document document) {
		TransformerFactory factory = TransformerFactory.newInstance();
		Transformer transformer = null;
		try {
			transformer = factory.newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			transformer.setOutputProperty(OutputPropertiesFactory.S_KEY_INDENT_AMOUNT, "2");
			Result result = new StreamResult(new File(getServletContext().getInitParameter("file.location") + "GeoEdit/" + request.getParameter("file")));
			Source source = new DOMSource(document);
			try {
				transformer.transform(source, result);
			} catch (TransformerException e) {
				e.printStackTrace();
			}
		} catch (TransformerConfigurationException e) {
			e.printStackTrace();
		}		
	}
}
