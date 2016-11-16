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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.apache.ambari.view.AmbariHttpException;
import org.apache.ambari.view.ViewContext;
import org.apache.ambari.view.utils.ambari.AmbariApi;
import org.apache.ambari.view.utils.ambari.AmbariApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class AmbariDelegate extends BaseAmbariDelegate {
	
	private final static Logger LOGGER = LoggerFactory
			.getLogger(AmbariDelegate.class);
	private static final String VIEW_NAME = "beacon-view";
	// private static final String HIVE_METASTORE_URI_KEY =
	// "hive.metastore.uris";
	// private static final String FS_KEY = "fs.defaultFS";
	private final AmbariApi ambariApi;
	private ViewContext viewContext;

	public AmbariDelegate(ViewContext viewContext) {
		super();
		this.viewContext = viewContext;
		this.ambariApi = new AmbariApi(viewContext);
		this.ambariApi.setRequestedBy(VIEW_NAME);

	}

	public List<ClusterInfo> getRemoteClusters() {
		JsonElement resp = readFromAmbariAsJson("remoteclusters?ClusterInfo/name.matches(.*.*)&fields=*", "GET", null,
				null);
		JsonObject remoteClusterJsonObj = resp.getAsJsonObject();
		ArrayList<ClusterInfo> remoteClusters = new ArrayList<ClusterInfo>();
		if (remoteClusterJsonObj.get("items") != null) {
			JsonArray itemsArray = remoteClusterJsonObj.get("items")
					.getAsJsonArray();
			for (int i = 0, size = itemsArray.size(); i < size; i++) {
				JsonObject clusterObject = itemsArray.get(i).getAsJsonObject();
				ClusterInfo cluster = new ClusterInfo();
				String url = clusterObject.get("ClusterInfo").getAsJsonObject()
						.get("url").getAsString();
				String clusterName = url.substring(url.lastIndexOf("/")+1, url.length());
				cluster.setUrl(url);
				cluster.setName(clusterName);
				remoteClusters.add(cluster);
			}
		}
		return remoteClusters;
	}

	private String getConfigurationData(String configurationType, String tag,Map<String, String> headers) {
		String configurationData = requestClusterAPI(getConfigurationPath(
				configurationType, tag),headers);
		return configurationData;
	}
	
	protected Map<String, String> getTagMap(JsonElement json) {
		HashMap<String, String> tagMap = new HashMap<String, String>();
		JsonObject desiredConfigs = json.getAsJsonObject().get("Clusters")
				.getAsJsonObject().get("desired_configs").getAsJsonObject();
		for (Map.Entry<String, JsonElement> entry : desiredConfigs.entrySet()) {
			String tag = entry.getValue().getAsJsonObject().get("tag")
					.getAsString();
			tagMap.put(entry.getKey(), tag);
		}
		return tagMap;
	}

	public ClusterDetailInfo getLocalClusterDetail(String configurationTypes[],final Map<String, String> headers) {
		// Map<String, String> clusterDetail = new HashMap<String, String>();
		// String webHdfsUrl = viewContext.getProperties().get("webhdfs.url");
		// String hiveUri =
		// viewContext.getProperties().get("hive.metastore.uri");
		// clusterDetail.put(FS_KEY, webHdfsUrl);
		// clusterDetail.put(HIVE_METASTORE_URI_KEY, hiveUri);
		// return clusterDetail;
		Map<String, String> allDesiredTagMap = getAllDesiredTag(headers);
		List<Future<String>> futures = new ArrayList<Future<String>>();
		for (final String configurationType : configurationTypes) {
			final String tag = allDesiredTagMap.get(configurationType);
			Callable<String> callable = new Callable<String>() {
				@Override
				public String call() throws Exception {
					return getConfigurationData(configurationType, tag,headers);
				}

			};
			Future<String> future = excutorPool.submit(callable);
			futures.add(future);
		}
		ClusterDetailInfo clusterDetails = new ClusterDetailInfo();
		clusterDetails.setName(viewContext.getCluster().getName());
		for (int i = 0; i < futures.size(); i++) {
			Future<String> result;
			try {
				result = futures.get(i);
				String config = result.get();
				processConfiguration(config, clusterDetails);
			} catch (InterruptedException e) {
				LOGGER.error(e.getMessage(), e);
			} catch (ExecutionException e) {
				LOGGER.error(e.getMessage(), e);
				throw new RuntimeException(e);
			}
		}
		return clusterDetails;
	}

	private Map<String, String> getAllDesiredTag(Map<String, String> headers) {
		JsonElement json = requestClusterAPIAsJson(DESIRED_CONFIGS_PATH,headers);
		return getTagMap(json);
	}

	private JsonElement requestClusterAPIAsJson(String path, Map<String, String> headers) {
		String resp = requestClusterAPI(path,headers);
		return new JsonParser().parse(resp);
	}

	private String requestClusterAPI(String path, Map<String, String> headers) {
		// return requestClusterAPIv1(path);
		return requestClusterAPIv2(path,headers);

	}

	private String requestClusterAPIv1(String path) {
		try {
			String resp = this.ambariApi.requestClusterAPI(path);
			return resp;
		} catch (AmbariApiException e) {
			LOGGER.error(e.getMessage(), e);
			throw new RuntimeException(e);
		} catch (AmbariHttpException e) {
			LOGGER.error(e.getMessage(), e);
			throw new RuntimeException(e);
		}
	}

	private JsonElement readFromAmbariAsJson(String path, String method,
			String data, Map<String, String> headers) {
		String resp = readFromAmbari(path, method, data, headers);
		return new JsonParser().parse(resp);
	}
	
	private String requestClusterAPIv2(String path, Map<String, String> headers) {
		if(headers.get("Accept-Encoding") != null){
			headers.remove("Accept-Encoding");
		}
		return readFromAmbari(AmbariApi.API_PREFIX
				+ viewContext.getCluster().getName() + "/" + path, "GET", null,
				headers);
	}

	private String readFromAmbari(String path, String method, String data,
			Map<String, String> headers) {
		try {
			if (!path.startsWith("/api")) {
				path = API_PREFIX +"/"+ path;
			}
			String resp = this.ambariApi.readFromAmbari(path, method, data,
					headers);
			return resp;
		} catch (AmbariApiException e) {
			LOGGER.error(e.getMessage(), e);
			throw new RuntimeException(e);
		} catch (AmbariHttpException e) {
			LOGGER.error(e.getMessage(), e);
			throw new RuntimeException(e);
		}

	}
}
