package main;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;

/** Servlet implementation class FileHandlerServlet to serve serve uploading, downloading, deleting and checking
 * of a file.
 */
public class FileHandlerServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /** The constructor of the FileHandlerServlet
     * @see HttpServlet#HttpServlet()
     */
    public FileHandlerServlet() {
        super();
    }

	/** Serves a HTTP POST request for the paths "/upload", "/download", "/delete" and "/check" 
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String path = getServletContext().getInitParameter("file.location") + "GeoEdit/";
	    
        if (request.getServletPath().equals("/upload")) {
			upload(request, response, path);
		}
        if (request.getServletPath().equals("/download")) {
			String fileName = request.getParameter("file");
		    String fullPath = path + fileName; 
		    File file = new File(fullPath);
			download(request, response, fullPath, file);
		}
		if (request.getServletPath().equals("/delete")) {
			String fileName = request.getParameter("file");
		    String fullPath = path + fileName; 
		    File file = new File(fullPath);
			delete(request, response, file);
		}
		if (request.getServletPath().equals("/check")) {
		    File file = new File(path + "/");
			getUploads(request, response, file);
		}		  
	}

	/** Serves a HTTP POST request by calling the implemented doGet method.
	 * 
	 * @patam request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}
	
	/** Uploads a file via request informations to a directory with a given path and responds, if the upload was successful or not.
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param path The path of the destination directory
	 * @throws ServletException
	 * @throws IOException
	 */
	protected void upload(HttpServletRequest request, HttpServletResponse response, String path) throws ServletException, IOException {
		PrintWriter writer = null;
        InputStream is = null;
        FileOutputStream fos = null;
        try {
            writer = response.getWriter();
        } catch (IOException ex) {
        	ex.printStackTrace();
        }
        String filename = request.getHeader("X-File-Name");
        try {
            is = request.getInputStream();
            File test = new File(path + filename);
            fos = new FileOutputStream(test);
            IOUtils.copy(is, fos);
            response.setStatus(HttpServletResponse.SC_OK);
            writer.print("{success: true}" + "\n" + test);
        } catch (FileNotFoundException ex) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writer.print("{success: false}");
        } catch (IOException ex) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writer.print("{success: false}");
        } catch (NullPointerException e) {
        	 response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        	 writer.print(e.getMessage());
        }
        finally {
            try {
                fos.close();
                is.close();
            } catch (IOException ignored) {
            	writer.print(ignored.getMessage());
            }
            catch(NullPointerException ne) {
            	writer.print(ne.getMessage());
            }
        }
        writer.flush();
        writer.close();
	}

	/** Downloads a given file.
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param path The path of the file to download.
	 * @param downloadFile The file to download.
	 * @throws IOException
	 */
	private void download(HttpServletRequest request, HttpServletResponse response, String path, File downloadFile) throws IOException{
        FileInputStream inStream = new FileInputStream(downloadFile);
        ServletContext context = getServletContext();
        String mimeType = context.getMimeType(path);
        if (mimeType == null) {        
            mimeType = "application/octet-stream";
        }
        response.setContentType(mimeType);
        response.setContentLength((int) downloadFile.length());
        String headerKey = "Content-Disposition";
        String headerValue = String.format("attachment; filename=\"%s\"", downloadFile.getName());
        response.setHeader(headerKey, headerValue);
        OutputStream outStream = response.getOutputStream();       
        byte[] buffer = new byte[1024];
        int bytesRead = -1;       
        while ((bytesRead = inStream.read(buffer)) != -1) {
            outStream.write(buffer, 0, bytesRead);
        }
        inStream.close();
        outStream.close();
	}
	
	/** Deletes a given file.
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param deleteFile The file to delete.
	 * @throws ServletException
	 * @throws IOException
	 */
	private void delete(HttpServletRequest request, HttpServletResponse response, File deleteFile) throws ServletException, IOException{
	    File file = deleteFile;
	    file.delete(); 
	    RequestDispatcher dispatcher = request.getRequestDispatcher("/");
		dispatcher.forward(request, response);    
	}
	
	/** Gets the names of all available xml files in the current tmp directory and passes them as a list via HttpServletResponse.
	 * 
	 * @param request The request stream to pass the request parameter.
	 * @param response The response stream to pass the response.
	 * @param file
	 * @throws ServletException
	 * @throws IOException
	 */
	private void getUploads(HttpServletRequest request, HttpServletResponse response, File file) throws ServletException, IOException{
		List<String> filelist = new ArrayList<String>();
		String directory = System.getProperty("java.io.tmpdir");
	    File temp = new File(directory + "/GeoEdit");	    
	    if (!temp.isDirectory()) { 
	    	temp.mkdir();
	    }
	    File[] files = temp.listFiles(); 
	    if (files != null) {
	    	for (File singlefile : files) {
	    		if (singlefile.isFile() & singlefile.getName().endsWith(".xml")) {
	    			filelist.add(singlefile.getName());
	    		}
	    	}
	    }	
	    response.setContentType("text/plain");  // Set content type of the response so that jQuery knows what it can expect.
	    response.setCharacterEncoding("UTF-8");
	    response.getWriter().write(filelist.toString());
	}
}
