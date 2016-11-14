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

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class BeaconProxy {
	private final static Logger LOGGER = LoggerFactory
			.getLogger(BeaconProxy.class);

	private static final String USER_NAME_HEADER = "user.name";
	private static final String USER_BEACON_SUPER = "beacon";
	private static final String DO_AS_HEADER = "doAs";
	private ViewContext viewContext;
	private AmbariUtils ambariUtils;

	public BeaconProxy(ViewContext viewContext) {
		super();
		this.viewContext=viewContext;
		this.ambariUtils = new AmbariUtils(viewContext);
	}

	public Response consumeService(String serviceUrl,HttpHeaders headers,  UriInfo ui,
			String httpMethod, String body)  {
		return consumeService(serviceUrl,headers, ui, httpMethod, body, null);
	}

	public Response consumeService(String serviceUrl,HttpHeaders headers,  UriInfo ui,
			String httpMethod, String body, Map<String, String> customHeaders) {
		Response response = null;
		InputStream stream = readFromBeaconService(headers, serviceUrl+buildRequestParams(ui),
				httpMethod, body, customHeaders);
		String stringResponse = null;
		try {
			stringResponse = IOUtils.toString(stream);
		} catch (IOException e) {
			LOGGER.error("Error while converting stream to string", e);
			throw new RuntimeException(e);
		}
		if (!isJsonString(stringResponse)) {
			response = Response.status(Response.Status.OK).entity(stringResponse).type(deduceType(stringResponse)).build();
		} else {
			JsonElement jelement = new JsonParser().parse(stringResponse);
			if (jelement instanceof JsonObject &&  jelement.getAsJsonObject().get("status")!=null){//if error response from beacon throw BAD REQUEST TO THE CLIENT.
				String status= jelement.getAsJsonObject().get("status").getAsString();
				if ("FAILED".equals(status) || "PARTIAL".equals(status)){
					return Response.status(Response.Status.BAD_REQUEST).entity(getGenericEntityFromJson(stringResponse)).build();
				}
			}
			GenericEntity<Object> entity = getGenericEntityFromJson(stringResponse);
			response = Response.status(Response.Status.OK).entity(entity)
					.type(deduceType(stringResponse)).build();
		}
		return response;
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

	private String buildRequestParams(UriInfo ui) {
			MultivaluedMap<String, String> parameters = ui.getQueryParameters();
		StringBuilder urlBuilder = new StringBuilder();
		boolean firstEntry = true;
		for (Map.Entry<String, List<String>> entry : parameters.entrySet()) {
			if (BeaconViewConstants.REMOTE_BEACON_ENDPOINT.equals(entry.getKey())){
				continue;
			}
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
	
	private boolean isJsonString(String stringResponse) {
		return stringResponse.startsWith("{") || stringResponse.startsWith("[");
	}

	private MediaType deduceType(String stringResponse) {
		if (isJsonString(stringResponse)) {
			return MediaType.APPLICATION_JSON_TYPE;
		} else if (stringResponse.startsWith("<")) {
			return MediaType.TEXT_XML_TYPE;
		} else {
			return MediaType.APPLICATION_JSON_TYPE;
		}
	}
	private GenericEntity<Object> getGenericEntityFromJson(
			String stringResponse) {
		Gson gson = new Gson();
		Object object = gson.fromJson(stringResponse, Object.class);
		GenericEntity<Object> entity = new GenericEntity<Object>(object) {};
		return entity;
	}

}
