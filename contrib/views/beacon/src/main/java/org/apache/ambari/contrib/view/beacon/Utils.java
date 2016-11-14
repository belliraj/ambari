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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MultivaluedMap;

import org.apache.ambari.view.ViewContext;
import org.apache.commons.codec.binary.Base64;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class Utils {

	public Map<String, String> getBasicAuthHeaders(String username,
			String password) {
		Map<String, String> headers = new HashMap<String, String>();
		String authString = username + ":" + password;
		byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
		String authStringEnc = new String(authEncBytes);

		headers.put("Authorization", "Basic " + authStringEnc);
		return headers;
	}

	public String getServiceUri(ViewContext viewContext,
			String serviceUriProperty, String defaultServiceUri) {
		String serviceURI = viewContext.getProperties().get(serviceUriProperty) != null ? viewContext
				.getProperties().get(serviceUriProperty) : defaultServiceUri;
		return serviceURI;
	}

	public JsonElement parseJson(String value) {
		if (value == null || value.isEmpty()) {
			return null;
		}
		JsonElement jsonElement = new JsonParser().parse(value);
		return jsonElement;
	}

	public Map<String, String> getHeaders(HttpHeaders headers) {
		if (headers==null){
			return new HashMap<String, String>();
		}
		MultivaluedMap<String, String> requestHeaders = headers
				.getRequestHeaders();
		Set<Entry<String, List<String>>> headerEntrySet = requestHeaders
				.entrySet();
		HashMap<String, String> headersMap = new HashMap<String, String>();
		for (Entry<String, List<String>> headerEntry : headerEntrySet) {
			String key = headerEntry.getKey();
			List<String> values = headerEntry.getValue();
			headersMap.put(key, strJoin(values, ","));
		}
		return headersMap;
	}

	private String strJoin(List<String> strings, String separator) {
		StringBuilder stringBuilder = new StringBuilder();
		for (int i = 0, il = strings.size(); i < il; i++) {
			if (i > 0) {
				stringBuilder.append(separator);
			}
			stringBuilder.append(strings.get(i));
		}
		return stringBuilder.toString();
	}

}
