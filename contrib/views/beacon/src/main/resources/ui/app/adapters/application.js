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

export default DS.RESTAdapter.extend({
  urlForFindAll (modelName, snapshot){
    switch(modelName) {
      case 'cluster':
        return  Ember.ENV.API_URL + '/beaconService/api/beacon/cluster/list';
      default:
        return this._super(...arguments);
    }
  },
  urlForQuery(query, modelName){
    switch(modelName) {
      case 'cluster':
        return Ember.ENV.API_URL + '/beaconService/api/beacon/cluster/list';
      case 'policy':
        return Ember.ENV.API_URL + '/beaconService/api/beacon/policy/list';
      case 'instance':
        return `${Ember.ENV.API_URL}/remoteBeaconService/api/beacon/policy/instance/list/${query.policyName}?beaconEndpoint=${query.beaconEndpoint}`;
      case 'ambari-cluster':
        if(query.remote){
          return Ember.ENV.API_URL + '/listRemoteClusters';
        }
      default:
        return this._super(...arguments);
    }
  },
  urlForUpdateRecord (id, modelName, snapshot){
    switch(modelName) {
      case 'cluster':
        return Ember.ENV.API_URL + '/beaconService/api/beacon/cluster/getEntity/'+ query.name;
      case 'ambari-cluster':
        if(query.remote){
          return Ember.ENV.API_URL + '/remoteClusterDetails';
        }else{
          return Ember.ENV.API_URL + '/localClusterDetails';
        }
      default:
        return this._super(...arguments);
    }
  },
  urlForQueryRecord(query, modelName){
    switch(modelName) {
      case 'cluster':
        return Ember.ENV.API_URL + '/beaconService/api/beacon/cluster/getEntity/'+ query.name;
      case 'ambari-cluster':
        if(query.remote){
          return Ember.ENV.API_URL + '/remoteClusterDetails';
        }else{
          return Ember.ENV.API_URL + '/localClusterDetails';
        }
      default:
        return this._super(...arguments);
    }
  }
});
