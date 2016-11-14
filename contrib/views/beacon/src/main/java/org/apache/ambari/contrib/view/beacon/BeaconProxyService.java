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

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class BeaconProxyService {
	private final static Logger LOGGER = LoggerFactory
			.getLogger(LocalBeaconProxyService.class);

	protected ViewContext viewContext;

	protected Utils utils = new Utils();

	protected BeaconProxy beaconProxy;
	public BeaconProxyService(ViewContext context) {
		super();
		this.viewContext = context;
		beaconProxy=new BeaconProxy(context);
	}

	@GET
	@Path("/{path: .*}")
	public Response handleGet(@Context HttpHeaders headers, @Context UriInfo ui) {
		try {
			String serviceURI = getServiceUri(ui);
			return beaconProxy.consumeService(serviceURI,headers, ui, HttpMethod.GET, null);
		} catch (Exception ex) {
			LOGGER.error("Error in GET proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@POST
	@Path("/{path: .*}")
	public Response handlePost(String xml, @Context HttpHeaders headers,
			@Context UriInfo ui) {
		try {
			String serviceURI = getServiceUri(ui);
			return beaconProxy.consumeService(serviceURI,headers, ui, HttpMethod.POST, xml);
		} catch (Exception ex) {
			LOGGER.error("Error in POST proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@DELETE
	@Path("/{path: .*}")
	public Response handleDelete(@Context HttpHeaders headers,
			@Context UriInfo ui) {
		try {
			String serviceURI = getServiceUri(ui);
			return beaconProxy.consumeService(serviceURI,headers, ui, HttpMethod.DELETE, null);
		} catch (Exception ex) {
			LOGGER.error("Error in DELETE proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}

	@PUT
	@Path("/{path: .*}")
	public Response handlePut(String body, @Context HttpHeaders headers,
			@Context UriInfo ui) {

		try {
			String serviceURI = getServiceUri(ui);
			return beaconProxy.consumeService(serviceURI,headers, ui, HttpMethod.PUT, body);
		} catch (Exception ex) {
			LOGGER.error("Error in PUT proxy", ex);
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ex.toString()).build();
		}
	}


	protected abstract String getServiceUri(UriInfo ui) ;

}
