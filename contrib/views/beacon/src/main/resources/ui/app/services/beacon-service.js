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
import Ember from 'ember';

export default Ember.Service.extend({
  baseUrl : 'api/beaconService',
  getRegisteredClusters (){
    var url = this.get('baseUrl') + '/cluster/list';
    return Ember.$.get(url);
  },
  registerCluster (clusterName, clusterInfo){
    var url = this.get('baseUrl') + '/cluster/submit/' + clusterName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(clusterInfo),
      dataType: 'json'
    });
  },
  getPolicies(){
    var url = this.get('baseUrl') + '/policy/list';
    return Ember.$.get(url);
  },
  createPolicy(policy){
    var url = this.get('baseUrl') + '/policy/submit/' + policy.name;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(policy),
      dataType: 'json'
    });
  }
});
