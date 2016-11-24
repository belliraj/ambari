/*
*    Licensed to the Apache Software Foundation (ASF) under one or more
*    contributor license agreements.  See the NOTICE file distributed with
*    this work for additional information regarding copyright ownership.
*    The ASF licenses this file to You under the Apache License, Version 2.0
*    (the "License"); you may not use this file except in compliance with
*    the License.  You may obtain a copy of the License at
*
*        http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/
import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: 'name',
  extractMeta: function(store, typeClass, payload) {
    if (payload && payload.hasOwnProperty('totalResults')) {
      let meta = {totalResults : payload.totalResults};
      delete payload.totalResults;
      return meta;
    }
  },
  normalizeResponse (store, primaryModelClass, payload, id, requestType) {
    if(primaryModelClass.modelName === 'cluster'){

    }else if(primaryModelClass.modelName === 'ambari-cluster' && requestType === 'queryRecord'){
      payload.ambariCluster = {};
      payload.ambariCluster.name = payload.name;
      payload.ambariCluster.configurations = payload.configurations;
      delete payload.name;
      delete payload.configurations;
    }else if(primaryModelClass.modelName === 'ambari-cluster' && requestType === 'query'){
      var normalizedpayload = {
        ambariCluster : Ember.copy(payload)
      };
      payload = normalizedpayload;
    }
    return this._super(store, primaryModelClass, payload, id, requestType);
  }
});
