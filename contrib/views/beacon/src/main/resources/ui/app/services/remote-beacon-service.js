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
  baseUrl : Ember.ENV.API_URL + '/remoteBeaconService/api/beacon',
  beaconService : Ember.inject.service('beacon-service'),

  registerCluster (clusterName, clusterInfo, beaconEndpoint){
    var data = '';
    Object.keys(clusterInfo).forEach((key)=>{
      data = data+key+'='+clusterInfo[key]+'\n';
    });
    var url = this.get('baseUrl') + '/cluster/submit/' + clusterName + '?beaconEndpoint=' + beaconEndpoint;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: 'text'
    });
  },
  getRegisteredClusters(beaconEndpoint){
    var url = this.get('baseUrl') + '/cluster/list' + '?beaconEndpoint=' + beaconEndpoint;
    return Ember.$.get(url);
  },
  createPolicy(policy){
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconService').getClusterInfo(policy.get('targetCluster')).done((clusterInfo)=>{
        var url = this.get('baseUrl') + '/policy/submit/' + policy.get('name') + '?beaconEndpoint=' + clusterInfo.beaconEndpoint;
        var data = '';
        Object.keys(policy).forEach((key)=>{
          data = data+key+'='+policy[key]+'\n';
        });
        Ember.$.ajax({
          type: "POST",
          url: url,
          data: data,
          dataType: 'json'
        }).done(()=>{
          resolve();
        }).fail((e)=>{
          reject(e);
        });
      }.bind(this)).fail((e)=>{
        reject(e);
      });
    });
  },
  schedulePolicy(policy){
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconService').getClusterInfo(policy.get('targetCluster')).done((clusterInfo)=>{
        var url = this.get('baseUrl') + '/policy/schedule/' + policy.get('name') + '?beaconEndpoint=' + clusterInfo.beaconEndpoint;
        Ember.$.ajax({
          type: "POST",
          url: url,
          dataType: 'json'
        }).done(()=>{
          resolve();
        }).fail((e)=>{
          reject(e);
        });
      }.bind(this)).fail((e)=>{
        reject(e);
      });
    });
  },
  suspendPolicy(policy){
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconService').getClusterInfo(policy.get('targetCluster')).done((clusterInfo)=>{
        var url = this.get('baseUrl') + '/policy/suspend/' + policy.get('name') + '?beaconEndpoint=' + clusterInfo.beaconEndpoint;
        Ember.$.ajax({
          type: "POST",
          url: url,
          dataType: 'json'
        }).done(()=>{
          resolve();
        }).fail((e)=>{
          reject(e);
        });
      }.bind(this)).fail((e)=>{
        reject(e);
      });
    });
  },
  resumePolicy(policy){
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconService').getClusterInfo(policy.get('targetCluster')).done((clusterInfo)=>{
        var url = this.get('baseUrl') + '/policy/resume/' + policy.get('name') + '?beaconEndpoint=' + clusterInfo.beaconEndpoint;
        Ember.$.ajax({
          type: "POST",
          url: url,
          dataType: 'json'
        }).done(()=>{
          resolve();
        }).fail((e)=>{
          reject(e);
        });
      }.bind(this)).fail((e)=>{
        reject(e);
      });
    });
  },
  deletePolicy(policy){
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconService').getClusterInfo(policy.get('targetCluster')).done((clusterInfo)=>{
        var url = this.get('baseUrl') + '/policy/delete/' + policy.get('name') + '?beaconEndpoint=' + clusterInfo.beaconEndpoint;
        Ember.$.ajax({
          type: "DELETE",
          url: url,
          dataType: 'json'
        }).done(()=>{
          resolve();
        }).fail((e)=>{
          reject(e);
        });
      }.bind(this)).fail((e)=>{
        reject(e);
      });
    });
  }
});
