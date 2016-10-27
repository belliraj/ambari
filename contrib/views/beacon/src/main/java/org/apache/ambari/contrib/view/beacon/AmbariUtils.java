package org.apache.ambari.contrib.view.beacon;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.HttpHeaders;

import org.apache.ambari.view.URLStreamProvider;
import org.apache.ambari.view.ViewContext;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class AmbariUtils {

	private static final String PROXY_CONTENT_TYPE = "Custom-Content-Type";
	private final static Logger LOGGER = LoggerFactory
			.getLogger(AmbariUtils.class);
	private ViewContext viewContext;
	private Utils utils = new Utils();

	public AmbariUtils(ViewContext viewContext) {
		super();
		this.viewContext = viewContext;
	}

	public JsonElement readFromUrlAsJsonObject(String urlToRead, String method,
			String body, HttpHeaders headers, Map<String, String> customHeaders) {
		return utils.parseJson(readFromUrlAsString(urlToRead, method, body,
				headers, customHeaders));

	}

	public String readFromUrlAsString(String urlToRead, String method,
			String body, HttpHeaders headers, Map<String, String> customHeaders) {

		InputStream inputStream = readFromUrl(urlToRead, method, body, headers,
				customHeaders);
		String stringResponse = null;
		try {
			stringResponse = IOUtils.toString(inputStream);
			return stringResponse;
		} catch (IOException e) {
			LOGGER.error("Error while converting stream to string", e);
			throw new RuntimeException(e);
		}
	}

	public InputStream readFromUrl(String urlToRead, String method,
			String body, HttpHeaders headers, Map<String, String> customHeaders) {
		LOGGER.info(String.format("Proxy request for url: [%s] %s", method,
				urlToRead));
		Map<String, String> mergedHeaders = utils.getHeaders(headers);
		if (mergedHeaders!=null && mergedHeaders.containsKey(PROXY_CONTENT_TYPE)){
			mergedHeaders.put("Content-Type", mergedHeaders.get(PROXY_CONTENT_TYPE));
			mergedHeaders.remove(PROXY_CONTENT_TYPE);
		}
		if (customHeaders != null) {
			mergedHeaders.putAll(customHeaders);
		}
		boolean securityEnabled = this.isSecurityEnabled(viewContext);
		LOGGER.debug(String.format("Is security enabled:[%b]", securityEnabled));
		URLStreamProvider streamProvider = viewContext.getURLStreamProvider();
		InputStream stream = null;
		try {
			if (securityEnabled) {
				stream = streamProvider.readAsCurrent(urlToRead, method, body,
						mergedHeaders);

			} else {
				stream = streamProvider.readFrom(urlToRead, method, body,
						mergedHeaders);
			}
		} catch (IOException e) {
			LOGGER.error("error talking to beacon", e);
			throw new RuntimeException(e);
		}
		return stream;
	}

	public boolean isSecurityEnabled(ViewContext viewContext) {
		boolean securityEnabled = Boolean.valueOf(viewContext.getInstanceData()
				.get("security_enabled"));
		return securityEnabled;
	}
	
}
