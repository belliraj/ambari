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
    var registeredCluster = this.modelFor('data-manager').registeredClusters.entity;
    model.currentCluster = registeredCluster.findBy('name',this.modelFor('data-manager').currentCluster.name);
    if(model.currentCluster){
      model.pairedClusters = model.currentCluster.peers;
    }else{
      model.pairedClusters = [];
    }
  },
  model(){
      return Ember.RSVP.hash({
         policies : this.get('beaconService').getPolicies()
      });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
  },
  actions : {
    createPolicy(){
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', true);
    },
    savePolicy(policy){
      this.get('beaconService').createPolicy(policy).done(()=>{
        this.refresh();
      }).fail(()=>{
        console.error("Policy creation failed");
      });
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
    }
  }
});
