/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ambari.contrib.view.beacon;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BeaconProxyService {
	private final static Logger LOGGER = LoggerFactory
			.getLogger(BeaconProxyService.class);
	private static final String USER_NAME_HEADER = "user.name";
	private static final String USER_BEACON_SUPER = "beacon";
	private static final String DO_AS_HEADER = "doAs";
	private ViewContext viewContext;
	private static final String SERVICE_URI_PROP = "beacon.service.uri";
	// private static final String DEFAULT_SERVICE_URI =
	// "http://sandbox.hortonworks.com:25000/beacon";
	private static final String DEFAULT_SERVICE_URI = "http://localhost:8090";
	private Utils utils = new Utils();
	private AmbariUtils ambariUtils;
	private final int BEACON_URI_PORTION_LEN = "proxy/beaconService".length();

	public BeaconProxyService(ViewContext context) {
		super();
		this.viewContext = context;
		this.ambariUtils = new AmbariUtils(viewContext);
	}

	@GET
	@Path("/{path: .*}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN,
			MediaType.TEXT_HTML, MediaType.APPLICATION_XML })
	public Response handleGet(@Context HttpHeaders headers, @Context UriInfo ui) {
		try {
			String serviceURI = buildURI(ui);
			return consumeService(headers, serviceURI, HttpMethod.GET, null);
		} catch (Exception ex) {
			LOGGER.error("Error in GET proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}

	}

	@POST
	@Path("/{path: .*}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN,
			MediaType.TEXT_HTML, MediaType.APPLICATION_XML })
	public Response handlePost(String xml, @Context HttpHeaders headers,
			@Context UriInfo ui) {
		try {
			String serviceURI = buildURI(ui);
			return consumeService(headers, serviceURI, HttpMethod.POST, xml);
		} catch (Exception ex) {
			LOGGER.error("Error in POST proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@DELETE
	@Path("/{path: .*}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN,
			MediaType.TEXT_HTML, MediaType.APPLICATION_XML })
	public Response handleDelete(@Context HttpHeaders headers,
			@Context UriInfo ui) {
		try {
			String serviceURI = buildURI(ui);
			return consumeService(headers, serviceURI, HttpMethod.POST, null);
		} catch (Exception ex) {
			LOGGER.error("Error in DELETE proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@PUT
	@Path("/{path: .*}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN,
			MediaType.TEXT_HTML, MediaType.APPLICATION_XML })
	public Response handlePut(String body, @Context HttpHeaders headers,
			@Context UriInfo ui) {

		try {

			String serviceURI = buildURI(ui);
			return consumeService(headers, serviceURI, HttpMethod.PUT, body);
		} catch (Exception ex) {
			LOGGER.error("Error in PUT proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@GET
	@Path("/status")
	public String getStatus() {
		return "ok";
	}

	public Response consumeService(HttpHeaders headers, String urlToRead,
			String httpMethod, String body) throws Exception {
		return consumeService(headers, urlToRead, httpMethod, body, null);
	}

	public Response consumeService(HttpHeaders headers, String urlToRead,
			String httpMethod, String body, Map<String, String> customHeaders) {
		Response response = null;
		InputStream stream = readFromBeaconService(headers, urlToRead,
				httpMethod, body, customHeaders);
		String stringResponse = null;
		try {
			stringResponse = IOUtils.toString(stream);
		} catch (IOException e) {
			LOGGER.error("Error while converting stream to string", e);
			throw new RuntimeException(e);
		}
		if (stringResponse.contains(Response.Status.BAD_REQUEST.name())) {
			response = Response.status(Response.Status.BAD_REQUEST)
					.entity(stringResponse).type(MediaType.TEXT_PLAIN).build();
		} else {
			response = Response.status(Response.Status.OK)
					.entity(stringResponse).type(deduceType(stringResponse))
					.build();
		}
		return response;
	}

	private MediaType deduceType(String stringResponse) {
		if (stringResponse.startsWith("{")) {
			return MediaType.APPLICATION_JSON_TYPE;
		} else if (stringResponse.startsWith("<")) {
			return MediaType.TEXT_XML_TYPE;
		} else {
			return MediaType.APPLICATION_JSON_TYPE;
		}
	}

	private InputStream readFromBeaconService(HttpHeaders headers,
			String urlToRead, String method, String body,
			Map<String, String> customHeaders) {
		if (customHeaders == null) {
			customHeaders = new HashMap<String, String>();
		}
		customHeaders.put(USER_NAME_HEADER, USER_BEACON_SUPER);
		customHeaders.put(DO_AS_HEADER, viewContext.getUsername());
		customHeaders.put("Accept", MediaType.APPLICATION_JSON);
		InputStream stream = ambariUtils.readFromUrl(urlToRead, method, body,
				headers, customHeaders);
		return stream;
	}

	private String buildURI(UriInfo ui) {
		String uiURI = ui.getAbsolutePath().getPath();

		int index = uiURI.indexOf("proxy/") + BEACON_URI_PORTION_LEN;
		uiURI = uiURI.substring(index);
		String serviceURI = getServiceUri();
		serviceURI += uiURI;

		MultivaluedMap<String, String> parameters = ui.getQueryParameters();
		StringBuilder urlBuilder = new StringBuilder(serviceURI);
		boolean firstEntry = true;
		for (Map.Entry<String, List<String>> entry : parameters.entrySet()) {
			if ("user.name".equals(entry.getKey())) {
				ArrayList<String> vals = new ArrayList<String>();
				vals.add(viewContext.getUsername());
				entry.setValue(vals);
			}
			if (firstEntry) {
				urlBuilder.append("?");
			} else {
				urlBuilder.append("&");
			}
			boolean firstVal = true;
			for (String val : entry.getValue()) {
				urlBuilder.append(firstVal ? "" : "&").append(entry.getKey())
						.append("=").append(val);
				firstVal = false;
			}
			firstEntry = false;
		}
		return urlBuilder.toString();
	}

	private String getServiceUri() {
		return utils.getServiceUri(viewContext, SERVICE_URI_PROP,
				DEFAULT_SERVICE_URI);
	}

}
