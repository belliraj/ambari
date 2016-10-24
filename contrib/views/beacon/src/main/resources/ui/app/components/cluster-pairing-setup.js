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
  localClusterDetails : {},
  initialize : function(){
    var localCluster = this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'));
    if(localCluster){
      this.set('localClusterDetails', Ember.copy(localCluster));
    }else{
      this.set('localClusterDetails', this.extractRegistrationInfo(this.get('currentCluster')));
    }
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
    var remoteClusterInfoDeferred = Ember.RSVP.defer();
    if(!this.get('registeredClusters.entity').findBy('name', targetCluster.name)){
      var ambariUrlLength = targetCluster.url.indexOf('api') - 1;
      var remoteAmbariUrl = targetCluster.url.substr(0, ambariUrlLength);
      return this.get('beaconViewService').getRemoteClusterInfo(remoteAmbariUrl,
        {'userName': targetCluster.username,'password' : targetCluster.password}).done((clusterInfo)=>{
          remoteClusterInfoDeferred.resolve(clusterInfo);
        }.bind(this)).fail(()=>{
          remoteClusterInfoDeferred.resolve();
        });
      }
      return remoteClusterInfoDeferred.promise;
    },
    registerSourceCluster(){
      var sourceClusterDeferred = Ember.RSVP.defer();
      if(!this.get('registeredClusters.entity').findBy('name', this.get('currentCluster.name'))){
        this.set('statusMessage', 'Registering source cluster...');
        this.registerCluster(this.get('localClusterDetails.name'), this.get('localClusterDetails')).done(()=>{
          sourceClusterDeferred.resolve();
        }.bind(this)).fail(()=>{
          sourceClusterDeferred.reject();
        });
      }else{
        sourceClusterDeferred.resolve();
      }
      return sourceClusterDeferred.promise;
    },
    registerTargetCluster(targetCluster){
      var targetClusterDeferred = Ember.RSVP.defer();
      this.getTargetClusterInfo(targetCluster).then((targetClusterInfo)=>{
        targetClusterInfo.name = targetCluster.name;
        this.set('currentTargetInfo', targetClusterInfo);
        if(!this.get('registeredClusters.entity').findBy('name', targetCluster.name)){
          this.set('statusMessage', 'Registering target cluster...');
          this.registerCluster(targetCluster.name, this.extractRegistrationInfo(targetClusterInfo)).done(()=>{
            targetClusterDeferred.resolve();
          }.bind(this)).fail(()=>{
            targetClusterDeferred.reject();
          });
        }
      }.bind(this));
      return targetClusterDeferred.promise;
    },
    pairClusters(){
      var pairClustersDeferred = Ember.RSVP.defer();
      this.get('beaconService').pairClusters(this.get('currentTargetInfo').name, this.get('currentTargetInfo').remoteBeaconEndpoint).done(()=>{
        pairClustersDeferred.resolve();
      }.bind(this)).fail(()=>{
        pairClustersDeferred.reject();
      });
      return pairClustersDeferred.promise;
    },
    actions : {
      pairCluster(index){
        var targetCluster = this.get('remoteClusters').objectAt(index);
        this.registerSourceCluster().then(()=>{
          this.registerTargetCluster(targetCluster).then(()=>{
            this.pairClusters();
          }.bind(this));
        }.bind(this));
      }
    }
  });
