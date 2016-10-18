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
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public abstract class BaseAmbariDelegate {
	protected static final ScheduledExecutorService excutorPool = Executors
			.newScheduledThreadPool(3);
	protected static final String DESIRED_CONFIGS_PATH = "?fields=Clusters/desired_configs";
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
	protected void processConfiguration(String config,
			ClusterDetailInfo clusterDetails) {
		JsonElement configObj = new JsonParser().parse(config);
		JsonArray itemsArray = configObj.getAsJsonObject().get("items")
				.getAsJsonArray();
		if (itemsArray != null && itemsArray.size() > 0) {
			itemsArray.get(0).getAsJsonObject();
			JsonObject firstItem = configObj.getAsJsonObject().get("items")
					.getAsJsonArray().get(0).getAsJsonObject();
			JsonObject propsObj = firstItem.get("properties").getAsJsonObject();
			HashMap<String, String> properties = new HashMap<String, String>();
			for (Map.Entry<String, JsonElement> entry : propsObj.entrySet()) {
				properties.put(entry.getKey(), entry.getValue().getAsString());
			}
			clusterDetails.addConfiguration(
					firstItem.get("type").getAsString(), properties);
		}

	}
	protected String getConfigurationPath(
			final String configurationType, final String tag) {
		return "/configurations?type=" + configurationType
									+ "&tag=" + tag;
	}
}
