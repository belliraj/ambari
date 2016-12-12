/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ambari.contrib.view.beacon;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.ambari.view.ViewContext;
import org.apache.hadoop.security.UserGroupInformation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.inject.Singleton;

@Singleton
public class BeaconViewService {
	private final static Logger LOGGER = LoggerFactory
			.getLogger(BeaconViewService.class);
	private final String[] configTypes = { "core-site", "hive-site" };
	private final static String HIVE_SERVICE_URI_PROP = "hive.rest.uri";
	private static final String DEFAULT_HIVE_SERVICE_URI = "http://b7001.ambari.vagrant.test:50111";
	private RemoteAmbariDelegate remoteAmbariDelegate;
	private AmbariDelegate ambariDelegate;
	private AmbariUtils ambariUtils;
	private ViewContext viewContext;
	private Utils utils = new Utils();

	@Inject
	public BeaconViewService(ViewContext viewContext) {
		super();
		this.viewContext = viewContext;
		this.remoteAmbariDelegate = new RemoteAmbariDelegate(viewContext);
		this.ambariDelegate = new AmbariDelegate(viewContext);
		this.ambariUtils = new AmbariUtils(viewContext);

	}

	@Path("beaconService")
	public LocalBeaconProxyService beaconProxyService() {
		return new LocalBeaconProxyService(	viewContext);

	}
	
	@Path("remoteBeaconService")
	public RemoteBeaconProxyService remoteBeaconProxyService(){
		return new RemoteBeaconProxyService(viewContext);
	}

	@Path("fileServices")
	public FileServices fileServices() {
		return new FileServices(viewContext);
	}

	@GET
	@Path("hiveDBs")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getHiveDBs(@Context HttpHeaders headers) {
		LOGGER.debug("getting hive tables");
		String hiveDBGetUrl = getHiveServiceUri()
				+ "/templeton/v1/ddl/database?user.name="
				+ viewContext.getUsername();
		String hiveDbs = readFromHiveService(headers, hiveDBGetUrl, "GET",
				null, null);
		return Response.ok(getGenericEntityFromJson(hiveDbs)).build();
	}

	@GET
	@Path("listRemoteClusters")
	public List<ClusterInfo> getRemoteClusters(@Context HttpHeaders headers) {
		return ambariDelegate.getRemoteClusters();
	}

	@GET
	@Path("getUserInfo")
	public UserInfo getUserInfo(@Context HttpHeaders headers) {
		UserInfo userInfo = new UserInfo();
		userInfo.setName(viewContext.getUsername());
		try {
			UserGroupInformation currentUser = UserGroupInformation
					.getLoginUser();
			userInfo.setGroupNames(currentUser.getGroupNames());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return userInfo;
	}

	@GET
	@Path("localClusterDetails")
	public ClusterDetailInfo getLocalClusterDetail(@Context HttpHeaders headers) {
		return ambariDelegate.getLocalClusterDetail(configTypes,
				utils.getHeaders(headers));
	}

	@POST
	@Path("remoteClusterDetails")
	public ClusterDetailInfo getClusterDetail(String postBody,
			@Context HttpHeaders headers,
			@QueryParam("ambariUrl") String ambariUrl) {
		JsonObject jsonBody = utils.parseJson(postBody).getAsJsonObject();
		return remoteAmbariDelegate.getRemoteClusterConfigurations(ambariUrl,
				jsonBody.get("userName").getAsString(), jsonBody
						.get("password").getAsString(), configTypes);
	}



	private String readFromHiveService(HttpHeaders headers, String urlToRead,
			String method, String body, Map<String, String> customHeaders) {
		return ambariUtils.readFromUrlAsString(urlToRead, method, body,
				headers, customHeaders);

	}

	private String getHiveServiceUri() {
		return utils.getServiceUri(viewContext, HIVE_SERVICE_URI_PROP,
				DEFAULT_HIVE_SERVICE_URI);
	}
	
	private GenericEntity<Object> getGenericEntityFromJson(
			String stringResponse) {
		Gson gson = new Gson();
		Object object = gson.fromJson(stringResponse, Object.class);
		GenericEntity<Object> entity = new GenericEntity<Object>(object) {};
		return entity;
	}
}
