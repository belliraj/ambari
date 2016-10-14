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

export default Ember.Route.extend({
  beaconViewService : Ember.inject.service('beacon-view-service'),
  beaconService : Ember.inject.service('beacon-service'),

  setupController: function(controller, model) {
    this._super(controller, model);
  },

  afterModel(model){
    model.currentCluster = this.modelFor('data-manager').currentCluster
    model.registeredClusters = this.modelFor('data-manager').registeredClusters
  },

  model(){
    var currentCluster = this.modelFor('data-manager').currentCluster;
    var deferred = Ember.RSVP.defer();
    var remoteClustersPromise = this.get('beaconViewService').getRemoteClusters(currentCluster.name);
    var promise =  Ember.RSVP.hash({
      remoteClusters : remoteClustersPromise,
    });
    deferred.resolve(promise);
    return deferred.promise;
  },

  actions : {
    registerClusters(clusters){
      clusters.forEach((cluster)=>{
        this.get('beaconService').registerCluster(cluster.name, cluster);
      }, this);
      this.controllerFor('data-manager.replication-setup').set('showClusterPopup', false);
      Ember.getOwner(this).lookup('route:data-manager').refresh();
    },
    setup(){
      this.controllerFor('data-manager.replication-setup').set('showClusterPopup', true);
    }
  }
});