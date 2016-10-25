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

export default Ember.Component.extend({
  beaconService : Ember.inject.service('beacon-service'),
  beaconViewService : Ember.inject.service('beacon-view-service'),
  errorHandler : Ember.inject.service('error-handler'),
  localClusterDetails : {},
  sourceClusterRegistrationInfo : Ember.computed('registeredClusters.entity.[]', function(){
    return this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'));
  }),
  sourceClusterPeers : Ember.computed('sourceClusterRegistrationInfo.peers.@each.id', function(){
    return this.get('sourceClusterRegistrationInfo').peers;
  }),
  sourceRegistered : Ember.computed('sourceClusterRegistrationInfo', function(){
    return !Ember.isEmpty(this.get('sourceClusterRegistrationInfo'));
  }),
  initialize : function(){
    if(this.get('sourceClusterRegistrationInfo')){
      this.set('localClusterDetails', Ember.copy(this.get('sourceClusterRegistrationInfo')));
    }else{
      this.set('localClusterDetails', this.extractRegistrationInfo(this.get('currentCluster')));
    }
    this.get('sourceClusterPeers');
  }.on('init'),
  extractRegistrationInfo(cluster){
    var clusterInfo = {};
    clusterInfo.name = cluster.name;
    clusterInfo.colo = cluster.dataCenter;
    clusterInfo.fsEndpoint = cluster.configurations['core-site']['fs.defaultFS'];
    clusterInfo.hsEndpoint = cluster.configurations['hive-site']['hive.metastore.uris'];
    return clusterInfo;
  },
  registerCluster(name, clusterInfo){
    return this.get('beaconService').registerCluster(name, clusterInfo);
  },
  getTargetClusterInfo(targetCluster){
    var ambariUrlLength = targetCluster.url.indexOf('api') - 1;
    var remoteAmbariUrl = targetCluster.url.substr(0, ambariUrlLength);
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconViewService').getRemoteClusterInfo(remoteAmbariUrl,
        {'userName': targetCluster.username,'password' : targetCluster.password}).done((clusterInfo)=>{
          // TODO - TEMP fix for duplicate cluster names.
          clusterInfo.name = targetCluster.name;
          resolve(clusterInfo);
        }.bind(this)).fail(()=>{
          reject();
        });
      }.bind(this));
    },
    registerSourceCluster(){
      return new Ember.RSVP.Promise((resolve, reject) => {
        if(!this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'))){
          this.set('statusMessage', 'Registering source cluster...');
          this.registerCluster(this.get('localClusterDetails.name'), this.get('localClusterDetails')).done(()=>{
            resolve();
            this.sendAction('update');
          }.bind(this)).fail(()=>{
            reject();
          });
        }else{
          resolve();
        }
      }.bind(this));
    },
    registerTargetCluster(targetClusterInfo){
      return new Ember.RSVP.Promise((resolve, reject) => {
          if(!this.get('registeredClusters.entity').findBy('name', targetClusterInfo.name)){
            this.set('statusMessage', 'Registering target cluster...');
            this.registerCluster(targetClusterInfo.name, this.extractRegistrationInfo(targetClusterInfo)).done(()=>{
              resolve();
              this.sendAction('update');
            }.bind(this)).fail(()=>{
              reject();
            });
          }else{
            resolve();
          }
      }.bind(this));
    },
    pairClusters(targetClusterInfo){
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.set('statusMessage', 'Pairing source and target clusters.');
        this.get('beaconService').pairClusters(targetClusterInfo.name, targetClusterInfo.remoteBeaconEndpoint).done(()=>{
          this.set('statusMessage', 'Paired source and target clusters.');
          resolve();
        }.bind(this)).fail(()=>{
          reject();
        });
      }.bind(this));
    },
    actions : {
      pairCluster(index){
        var targetCluster = this.get('remoteClusters').objectAt(index);
        this.registerSourceCluster().then(()=>{
          this.getTargetClusterInfo(targetCluster).then((clusterInfo)=>{
            this.registerTargetCluster(clusterInfo).then(()=>{
              this.pairClusters(clusterInfo).then(()=>{
                this.sendAction('update');
              }).catch(()=>{
                this.sendAction('onError', {message : 'Pairing of clusters failed.'});
                this.sendAction('update');
              }.bind(this));
            }.bind(this)).catch(() => {
              this.sendAction('onError',{message : 'Registration of target cluster failed.'});
              this.sendAction('update');
            }.bind(this));
          }.bind(this)).catch(() => {
            this.sendAction('onError', {message : 'Could not retrieve remote cluster details.'});
            this.sendAction('update');
          }.bind(this));
        }.bind(this)).catch(() => {
          this.sendAction('onError', {message : 'Registration of source cluster failed.'});
          this.sendAction('update');
        }.bind(this));
      }
    }
  });
