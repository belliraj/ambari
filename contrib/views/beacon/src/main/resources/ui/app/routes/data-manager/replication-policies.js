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
import Constants from '../../utils/constants';

export default Ember.Route.extend({
  beaconService : Ember.inject.service('beacon-service'),
  beaconViewService : Ember.inject.service('beacon-view-service'),
  breadcrumbService : Ember.inject.service('breadcrumb-service'),
  queryParams : {
    orderBy : {refreshModel : true},
    sortOrder : {refreshModel : true},
    offset : {refreshModel : true},
    numResults : {refreshModel : true}
  },
  afterModel(model){
    var registeredCluster = this.modelFor('data-manager').registeredClusters.entity;
    model.currentCluster = registeredCluster.findBy('name',this.modelFor('data-manager').currentCluster.name);
    if(model.currentCluster &&  model.currentCluster.peers){
      var peerNames = model.currentCluster.peers.split(",");
      var peers = [];
      peerNames.forEach((name) =>{
        peers.pushObject({'name' : name});
      }, this);
      model.pairedClusters = peers;
    }else{
      model.pairedClusters = [];
    }
  },
  model(params){
    return Ember.RSVP.hash({
       policies : this.get('beaconService').getPolicies(params),
       userInfo : this.get('beaconViewService').getUserInfo()
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
  },
  actions : {
    willTransition(){
      this.get('breadcrumbService').updateBreadcrumbs(this.routeName);
    },
    createPolicy(){
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', true);
    },
    savePolicy(policy){
      this.controllerFor('data-manager.replication-policies').set('creationInProgress', true);
      this.get('beaconService').createPolicy(policy).done(()=>{
        this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        this.refresh();
      }).fail(()=>{
        this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        console.error("Policy creation failed");
      });
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
    },
    schedule(name) {
      this.get('beaconService').schedulePolicy(name).done(()=>{
        this.refresh();
      }).fail(()=>{
        console.error("Policy suspend - failed");
      });
    },
    suspend(name) {
      this.get('beaconService').suspendPolicy(name).done(()=>{
        this.refresh();
      }).fail(()=>{
        console.error("Policy suspend - failed");
      });
    },
    resume(name) {
      this.get('beaconService').resumePolicy(name).done(()=>{
        this.refresh();
      }).fail(()=>{
        console.error("Policy resume - failed");
      });
    },
    delete(name) {
      this.get('beaconService').deletePolicy(name).done(()=>{
        this.refresh();
      }).fail(()=>{
        console.error("Policy delete - failed");
      });
    },
    didTransition() {
      this.get('breadcrumbService').showBreadcrumbs(this);
    },
    onError(error){
      this.controllerFor('data-manager.replication-policies').set('error', error);
    },
    goToPage(params){
      this.transitionTo('data-manager.replication-policies', {
        queryParams:{
        'offset' : params.offset
        }
      });
    }
  }
});
