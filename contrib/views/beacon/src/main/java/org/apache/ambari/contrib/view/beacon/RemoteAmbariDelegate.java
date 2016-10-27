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

import org.apache.ambari.view.ViewContext;
import org.apache.ambari.view.utils.ambari.AmbariApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RemoteAmbariDelegate extends BaseAmbariDelegate {

	private AmbariUtils ambariUtils;

	public RemoteAmbariDelegate(ViewContext viewContext) {
		super();
		this.ambariUtils = new AmbariUtils(viewContext);
	}

	private final static Logger LOGGER = LoggerFactory
			.getLogger(RemoteAmbariDelegate.class);

	private Utils utils = new Utils();

	private String getConfigurationData(final String url,
			final String userName, final String password,
			final String configurationType, final String tag) {
		String configurationData = readFromRemoteCluster(url + "/"
				+ getConfigurationPath(configurationType, tag), userName,
				password);
		return configurationData;
	}

	protected Map<String, String> getTagMap(JsonElement json) {
		HashMap<String, String> tagMap = new HashMap<String, String>();
		JsonObject desiredConfigs = json.getAsJsonObject().get("items")
				.getAsJsonArray().get(0).getAsJsonObject().get("Clusters")
				.getAsJsonObject().get("desired_configs").getAsJsonObject();
		for (Map.Entry<String, JsonElement> entry : desiredConfigs.entrySet()) {
			String tag = entry.getValue().getAsJsonObject().get("tag")
					.getAsString();
			tagMap.put(entry.getKey(), tag);
		}
		return tagMap;
	}

	public ClusterDetailInfo getRemoteClusterConfigurations(final String url,
			final String userName, final String password,
			String configurationTypes[]) {
		JsonElement json = readFromRemoteClusterAsJsonObject(url
				+ AmbariApi.API_PREFIX + DESIRED_CONFIGS_PATH, userName,
				password);
		Map<String, String> allDesiredTagMap = getTagMap(json);
		String clusterName = json.getAsJsonObject().get("items")
				.getAsJsonArray().get(0).getAsJsonObject().get("Clusters")
				.getAsJsonObject().get("cluster_name").getAsString();
		final String remoteAmbariClusterUrl = url
				+ AmbariApi.API_PREFIX + clusterName;

		List<Future<String>> futures = new ArrayList<Future<String>>();
		for (final String configurationType : configurationTypes) {
			final String tag = allDesiredTagMap.get(configurationType);
			Callable<String> callable = new Callable<String>() {
				@Override
				public String call() throws Exception {
					return getConfigurationData(remoteAmbariClusterUrl,
							userName, password, configurationType, tag);
				}
			};
			Future<String> future = excutorPool.submit(callable);
			futures.add(future);
		}
		ClusterDetailInfo clusterDetails = new ClusterDetailInfo();
		clusterDetails.setUrl(url);
		clusterDetails.setName(clusterName);

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

	private JsonElement readFromRemoteClusterAsJsonObject(String url,
			String userName, String password) {
		String resp = readFromRemoteCluster(url, userName, password);
		JsonElement jsonElement = new JsonParser().parse(resp);
		return jsonElement;
	}

	private String readFromRemoteCluster(String url, String userName,
			String password) {
		return ambariUtils.readFromUrlAsString(url, "GET", null, null,
				utils.getBasicAuthHeaders(userName, password));
	}
}
