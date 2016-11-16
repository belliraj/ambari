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
  remoteBeaconService : Ember.inject.service('remote-beacon-service'),
  beaconViewService : Ember.inject.service('beacon-view-service'),
  errorHandler : Ember.inject.service('error-handler'),
  localClusterDetails : {},
  sourceClusterRegistrationInfo : Ember.computed('registeredClusters.entity.[]', function(){
    return this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'));
  }),
  sourceClusterPeers : Ember.computed('sourceClusterRegistrationInfo.peers', function(){
    if(Ember.isEmpty(this.get('sourceClusterRegistrationInfo')) || Ember.isEmpty(this.get('sourceClusterRegistrationInfo').peers)){
      return [];
    }
    var peerNames =  this.get('sourceClusterRegistrationInfo').peers.split(",");
    var peers = [];
    peerNames.forEach((name) =>{
      peers.pushObject({'name' : name});
    }, this);
    return peers;
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
    clusterInfo.dataCenter = cluster.dataCenter;
    clusterInfo.fsEndpoint = cluster.configurations['core-site']['fs.defaultFS'];
    clusterInfo.hsEndpoint = cluster.configurations['hive-site']['hive.metastore.uris'];
    //TODO - fix later. description is mandatory in backend.
    clusterInfo.description = 'dummy';
    //TODO - Temp Fix. Later show error when beacon service is not setup
    clusterInfo.beaconEndpoint = cluster.beaconEndpoint;
    return clusterInfo;
  },
  getTargetClusterInfo(targetCluster){
    this.set('statusMessage', 'Fetching remote cluster details...');
    var ambariUrlLength = targetCluster.url.indexOf('api') - 1;
    var remoteAmbariUrl = targetCluster.url.substr(0, ambariUrlLength);
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconViewService').getRemoteClusterInfo(remoteAmbariUrl,
        {'userName': targetCluster.username,'password' : targetCluster.password}).done((clusterInfo)=>{
          clusterInfo.beaconEndpoint = remoteAmbariUrl.substr(0, targetCluster.url.indexOf('8080')) + '25000/beacon';
          //clusterInfo.name = targetCluster.name;
          clusterInfo.dataCenter = targetCluster.dataCenter;
          resolve(clusterInfo);
        }.bind(this)).fail((e)=>{
          console.error(e);
          reject(e);
        });
      }.bind(this));
    },
    registerSourceCluster(){
      this.set('statusMessage', 'Checking source cluster if is registered...');
      return new Ember.RSVP.Promise((resolve, reject) => {
        if(!this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'))){
          this.set('statusMessage', 'Registering source cluster...');
          this.get('beaconService').registerCluster(this.get('localClusterDetails.name'), this.get('localClusterDetails')).done(()=>{
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
    getClustersRegisteredInTarget(targetClusterInfo){
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('remoteBeaconService').getRegisteredClusters(targetClusterInfo.beaconEndpoint).done((registeredClusters) =>{
          resolve(registeredClusters);
        }.bind(this)).fail((e)=>{
          console.error(e);
          reject();
        });
      });
    },
    registerTargetCluster(targetClusterInfo){
      this.set('statusMessage', 'Checking target cluster if is registered...');
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.getClustersRegisteredInTarget(targetClusterInfo).then((clustersRegisteredInTarget)=>{
          if(!clustersRegisteredInTarget.entity.findBy('name', targetClusterInfo.name)){
            this.set('statusMessage', 'Registering target cluster...');
            this.get('remoteBeaconService').registerCluster(targetClusterInfo.name, this.extractRegistrationInfo(targetClusterInfo), targetClusterInfo.beaconEndpoint).done(()=>{
              resolve();
              this.sendAction('update');
            }.bind(this)).fail(()=>{
              reject();
            });
            this.sendAction('update');
          }else{
            resolve();
          }
        }.bind(this)).catch((e)=>{
          console.error(e);
          reject();
        }.bind(this));
      }.bind(this));
    },
    registerTargetClusterInSource(targetClusterInfo){
      this.set('statusMessage', 'Checking target cluster if is registered...');
      return new Ember.RSVP.Promise((resolve, reject) => {
        if(!this.get('registeredClusters.entity').findBy('name', targetClusterInfo.name)){
          this.set('statusMessage', 'Registering target cluster...');
          this.get('beaconService').registerCluster(targetClusterInfo.name, this.extractRegistrationInfo(targetClusterInfo)).done(()=>{
            resolve();
            this.sendAction('update');
          }.bind(this)).fail(()=>{
            reject();
          });
          this.sendAction('update');
        }else{
          resolve();
        }
      }.bind(this));
    },
    pairClusters(targetClusterInfo){
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.set('currentlyPaired', targetClusterInfo);
        this.set('statusMessage', 'Pairing source and target clusters.');
        this.get('beaconService').pairClusters(targetClusterInfo.name, targetClusterInfo.beaconEndpoint).done(()=>{
          this.set('statusMessage', 'Paired source and target clusters.');
          resolve();
        }.bind(this)).fail(()=>{
          reject();
        });
      }.bind(this));
    },
    disablePairingContainer(){
      this.$('#remote-clusters-list').find('input').prop('disabled','disabled');
      this.$('#remote-clusters-list').addClass('disabled-elt');
    },
    enablePairingContainer(){
      this.$('#remote-clusters-list').find('input').prop('disabled', false);
      this.$('#remote-clusters-list').removeClass('disabled-elt');
    },
    actions : {
      pairCluster(index){
        this.disablePairingContainer();
        var targetCluster = this.get('remoteClusters').objectAt(index);
        this.registerSourceCluster().then(()=>{
          this.getTargetClusterInfo(targetCluster).then((clusterInfo)=>{
            this.registerTargetCluster(clusterInfo).then(()=>{
              this.registerTargetClusterInSource(clusterInfo).then(() =>{
                this.pairClusters(clusterInfo).then(()=>{
                  this.set('currentlyPaired', {});
                  this.enablePairingContainer();
                  this.sendAction('update');
                }).catch((e)=>{
                  console.error(e);
                  this.sendAction('onError', {message : 'Pairing of clusters failed.'});
                  this.set('currentlyPaired', {});
                  this.enablePairingContainer();
                  this.sendAction('update');
                }.bind(this));
              }.bind(this)).catch((e) => {
                console.error(e);
                this.enablePairingContainer();
                this.sendAction('onError',{message : 'Registration of target cluster failed.'});
                this.sendAction('update');
              }.bind(this));
            }.bind(this)).catch((e) => {
              console.error(e);
              this.enablePairingContainer();
              this.sendAction('onError',{message : 'Registration of target cluster failed.'});
              this.sendAction('update');
            }.bind(this));
          }.bind(this)).catch((e) => {
            console.error(e);
            this.enablePairingContainer();
            this.sendAction('onError', {message : 'Could not retrieve remote cluster details.'});
            this.sendAction('update');
          }.bind(this));
        }.bind(this)).catch((e) => {
          console.error(e);
          this.enablePairingContainer();
          this.sendAction('onError', {message : 'Registration of source cluster failed.'});
          this.sendAction('update');
        }.bind(this));
      }
    }
  });
