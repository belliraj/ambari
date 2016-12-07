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

import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;

public class LocalBeaconProxyService extends BeaconProxyService{
	private static final String SERVICE_URI_PROP = "beacon.service.uri";
	private static final String DEFAULT_SERVICE_URI = "http://b7001.ambari.vagrant.test:25000";
	private final int BEACON_URI_PORTION_LEN = "proxy/beaconService".length();

	public LocalBeaconProxyService(ViewContext context) {
		super(context);		
	}
	
	@Override
	protected String getServiceUri(UriInfo ui) {
		String uiURI = ui.getAbsolutePath().getPath();
		return utils.getServiceUri(viewContext, SERVICE_URI_PROP,
				DEFAULT_SERVICE_URI)+getApiPath(uiURI);
	}

	private String getApiPath(String uiURI) {
		int index = uiURI.indexOf("proxy/") + BEACON_URI_PORTION_LEN;
		uiURI = uiURI.substring(index);
		return uiURI;
	}
}
