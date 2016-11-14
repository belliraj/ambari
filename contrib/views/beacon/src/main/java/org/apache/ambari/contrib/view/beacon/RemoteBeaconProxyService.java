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

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;

public class RemoteBeaconProxyService extends BeaconProxyService{

	public RemoteBeaconProxyService(ViewContext context) {
		super(context);
	}

	@Override
	protected String getServiceUri(UriInfo ui) {
		 MultivaluedMap<String, String> queryParameters = ui.getQueryParameters();
		 return queryParameters.getFirst(BeaconViewConstants.REMOTE_BEACON_ENDPOINT);
	}
	

}
