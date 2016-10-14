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
  beaconService : Ember.inject.service('beacon-service'),

  afterModel(model){
    var registeredCluster = this.modelFor('data-manager').registeredClusters;
    var pairedClusterNames = this.modelFor('data-manager').currentCluster.peers;
    var pairedClusters = [];
    pairedClusterNames.forEach((name)=>{
      pairedClusters.push(registeredCluster.findBy('name',name));
    });
    model.pairedClusters = pairedClusters;
  },

  model(){
    return this.modelFor('data-manager');
  },
  setupController: function(controller, model) {
    this._super(controller, model);
  },
  actions : {
    createPolicy(){
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', true);
    },
    savePolicy(policy){
      this.get('beaconService').createPolicy(policy);
      Ember.getOwner(this).lookup('route:data-manager').refresh();
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
    }
  }
});