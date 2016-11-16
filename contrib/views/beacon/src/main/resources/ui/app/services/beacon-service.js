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
import Constants from '../utils/constants';

export default Ember.Service.extend({
  baseUrl : Ember.ENV.API_URL + '/beaconService/api/beacon',
  getRegisteredClusters (){
    var url = this.get('baseUrl') + '/cluster/list';
    return Ember.$.get(url);
  },
  getClusterInfo(clusterName){
    var url = this.get('baseUrl') + '/cluster/get/' + clusterName;
    return Ember.$.get(url);
  },
  registerCluster (clusterName, clusterInfo){
    var data = '';
    Object.keys(clusterInfo).forEach((key)=>{
      data = data+key+'='+clusterInfo[key]+'\n';
    });
    var url = this.get('baseUrl') + '/cluster/submit/' + clusterName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: 'text'
    });
  },
  getPolicies(params){
    if(!params){
      params = {};
    }
    if(!params.offset){
      params.offset = 0;
    }
    params.pageSize = Constants.PAGINATION.pageSize;
    var url = this.get('baseUrl') + '/policy/list?offset='+params.offset+'&numResults='+params.pageSize;
    return Ember.$.get(url);
  },
  getIncomingPolicies(){
    var url = this.get('baseUrl') + '/policy/incoming/list';
    return Ember.$.get(url);
  },
  createPolicy(policy){
    var url = this.get('baseUrl') + '/policy/submit/' + policy.name;
    var data = '';
    Object.keys(policy).forEach((key)=>{
      data = data+key+'='+policy[key]+'\n';
    });
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: 'json'
    });
  },
  schedulePolicy(policyName){
    var url = this.get('baseUrl') + '/policy/schedule/' + policyName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      dataType: 'json'
    });
  },
  suspendPolicy(policyName){
    var url = this.get('baseUrl') + '/policy/suspend/' + policyName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      dataType: 'json'
    });
  },
  resumePolicy(policyName){
    var url = this.get('baseUrl') + '/policy/resume/' + policyName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      dataType: 'json'
    });
  },
  deletePolicy(policyName){
    var url = this.get('baseUrl') + '/policy/delete/' + policyName;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      dataType: 'json'
    });
  },
  pairClusters(remoteClusterName, remoteBeaconEndpoint){
    var url = this.get('baseUrl') + '/cluster/pair?remoteBeaconEndpoint=' + remoteBeaconEndpoint + '&remoteClusterName=' + remoteClusterName;
    return Ember.$.ajax({
      type: "POST",
      url: url
    });
  },
  getAllInstances(){
    var url = this.get('baseUrl') + '/policy/instances/list';
    return Ember.$.get(url);
  }
});
