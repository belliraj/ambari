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
  beaconSourceCluster : Ember.computed('registeredClusters', function(){
    return this.get('registeredClusters').findBy('name', this.get('localAmbariCluster.name'));
  }),
  sourceRegistered : Ember.computed('beaconSourceCluster', function(){
    return !Ember.isEmpty(this.get('beaconSourceCluster'));
  }),
  remoteClustersList : Ember.computed('registeredClusters.[]','remoteClusters', function(){
    var remoteClustersList = Ember.A([]);
    this.get('remoteClusters').forEach((cluster)=>{
      var correspondingRegisteredCluster = this.get('registeredClusters').findBy('name', cluster.get('name'));
      if(correspondingRegisteredCluster){
        Ember.set(cluster,'dataCenter', correspondingRegisteredCluster.get('dataCenter'));
      }
      remoteClustersList.pushObject(cluster);
    });
    return remoteClustersList;
  }),
  initialize : function(){
    //TODO Get beacon service uri from service definition
    var fsEndpoint = this.get('localAmbariCluster').get('configurations')['core-site']['fs.defaultFS'];
    this.set('localAmbariCluster.beaconEndpoint', 'http://'+ fsEndpoint.substring(fsEndpoint.indexOf('/')+2,
      fsEndpoint.lastIndexOf(':')) +':25000/beacon');
  }.on('init'),
  extractRegistrationInfo(cluster){
    var clusterInfo = {};
    clusterInfo.name = cluster.get('name');
    clusterInfo.dataCenter = cluster.get('dataCenter');
    clusterInfo.fsEndpoint = cluster.get('configurations')['core-site']['fs.defaultFS'];
    if( cluster.get('configurations')['hive-site']){
      clusterInfo.hsEndpoint = cluster.get('configurations')['hive-site']['hive.metastore.uris'];
    }
    //TODO - fix later. description is mandatory in backend.
    clusterInfo.description = 'dummy';
    //TODO - Temp Fix. Later show error when beacon service is not setup/not running
    clusterInfo.beaconEndpoint = cluster.get('beaconEndpoint');
    return clusterInfo;
  },
  getTargetClusterInfo(targetCluster){
    this.set('statusMessage', 'Fetching remote cluster details...');
    var ambariUrlLength = targetCluster.get('url').indexOf('api') - 1;
    var remoteAmbariUrl = targetCluster.get('url').substring(0, ambariUrlLength);
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('beaconViewService').getRemoteClusterInfo(remoteAmbariUrl,
        {'userName': targetCluster.get('username'),'password' : targetCluster.get('password')}).done((clusterInfo)=>{
          clusterInfo.beaconEndpoint = remoteAmbariUrl.substr(0, targetCluster.get('url').indexOf('8080')) + '25000/beacon';
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
        if(!this.get('registeredClusters').findBy('name', this.get('localAmbariCluster.name'))){
          this.set('statusMessage', 'Registering source cluster...');
          this.get('beaconService').registerCluster(this.get('localAmbariCluster.name'),
           this.extractRegistrationInfo(this.get('localAmbariCluster'))).done(()=>{
            resolve(this.extractRegistrationInfo(this.get('localAmbariCluster')));
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
          if(!clustersRegisteredInTarget.cluster.findBy('name', targetClusterInfo.name)){
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
        if(!this.get('registeredClusters').findBy('name', targetClusterInfo.name)){
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
    registerSourceClusterInTarget(targetClusterInfo){
      this.set('statusMessage', 'Checking target cluster if is registered...');
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.getClustersRegisteredInTarget(targetClusterInfo).then((clustersRegisteredInTarget)=>{
          if(!clustersRegisteredInTarget.cluster.findBy('name', this.get('localAmbariCluster.name'))){
            this.set('statusMessage', 'Registering source cluster in target beacon...');
            this.get('remoteBeaconService').registerCluster(this.get('localAmbariCluster.name'), this.extractRegistrationInfo(this.get('localAmbariCluster')),targetClusterInfo.beaconEndpoint).done(()=>{
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
        this.registerSourceCluster().then((src)=>{
          this.getTargetClusterInfo(targetCluster).then((clusterInfo)=>{
            clusterInfo=Ember.Object.create(clusterInfo)
            this.registerTargetCluster(clusterInfo).then(()=>{
              this.registerTargetClusterInSource(clusterInfo).then(() =>{
                this.registerSourceClusterInTarget(clusterInfo).then(() =>{
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
                }).catch((e)=>{
                  console.error(e);
                  this.enablePairingContainer();
                  this.sendAction('onError', {message : 'Registration of source cluster in target failed.'});
                  this.sendAction('update');
                });
              }.bind(this)).catch((e) => {
                console.error(e);
                this.enablePairingContainer();
                this.sendAction('onError',{message : 'Registration of target cluster in source failed.'});
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
