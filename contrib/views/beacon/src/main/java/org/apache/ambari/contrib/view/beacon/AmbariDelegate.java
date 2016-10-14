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

	public AmbariDelegate(ViewContext viewContext) {
		super();

		this.ambariApi = new AmbariApi(viewContext);
		this.ambariApi.setRequestedBy(VIEW_NAME);

	}

	public List<ClusterInfo> getRemoteClusters() {
		JsonElement resp = requestClusterAPIAsJson("remoteclusters");
		JsonObject remoteClusterJsonObj = resp.getAsJsonObject();
		ArrayList<ClusterInfo> remoteClusters = new ArrayList<ClusterInfo>();
		if (remoteClusterJsonObj.get("items") != null) {
			JsonArray itemsArray = remoteClusterJsonObj.get("items")
					.getAsJsonArray();
			for (int i = 0, size = itemsArray.size(); i < size; i++) {
				JsonObject clusterObject = itemsArray.get(i).getAsJsonObject();
				ClusterInfo cluster = new ClusterInfo();
				cluster.setUrl(clusterObject.get("href").getAsString());
				String clusterName = clusterObject.get("ClusterInfo")
						.getAsJsonObject().get("name").getAsString();
				cluster.setName(clusterName);
			}
		}
		return remoteClusters;
	}
	
	private String getConfigurationData(String configurationType,String tag) {
		String configurationData = requestClusterAPI(getConfigurationPath(configurationType, tag));
		return configurationData;
	}

	public ClusterDetailInfo getLocalClusterDetail(
			String configurationTypes[]) {
		// Map<String, String> clusterDetail = new HashMap<String, String>();
		// String webHdfsUrl = viewContext.getProperties().get("webhdfs.url");
		// String hiveUri =
		// viewContext.getProperties().get("hive.metastore.uri");
		// clusterDetail.put(FS_KEY, webHdfsUrl);
		// clusterDetail.put(HIVE_METASTORE_URI_KEY, hiveUri);
		// return clusterDetail;
		Map<String, String> allDesiredTagMap = getAllDesiredTag();
		List<Future<String>> futures = new ArrayList<Future<String>>();
		for (final String configurationType : configurationTypes) {
			final String tag = allDesiredTagMap.get(configurationType);
			Callable<String> callable = new Callable<String>() {
				@Override
				public String call() throws Exception {
					return getConfigurationData(
							configurationType, tag);
				}

			
			};
			Future<String> future = excutorPool.submit(callable);
			futures.add(future);
		}
		ClusterDetailInfo clusterDetails = new ClusterDetailInfo();

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

	private Map<String, String> getAllDesiredTag() {
		JsonElement json = requestClusterAPIAsJson(DESIRED_CONFIGS_PATH);
		return getTagMap(json);
	}

	private JsonElement requestClusterAPIAsJson(String path) {
		String resp = requestClusterAPI(path);
		return new JsonParser().parse(resp);
	}

	private String requestClusterAPI(String path) {
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
}