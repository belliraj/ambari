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
  remoteBeaconService : Ember.inject.service('remote-beacon-service'),
  breadcrumbService : Ember.inject.service('breadcrumb-service'),
  queryParams : {
    orderBy : {refreshModel : true},
    sortOrder : {refreshModel : true},
    offset : {refreshModel : true},
    numResults : {refreshModel : true}
  },
  afterModel(model){
    this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
    var registeredClusters = this.modelFor('data-manager').registeredClusters;
    model.beaconSourceCluster =  this.store.peekRecord('cluster', this.modelFor('data-manager').currentCluster.get('name'));
  },
  model(params){
    return Ember.RSVP.hash({
       policies : this.store.query('policy', {'fields':'tags,clusters,frequency,starttime,endtime,status'}),
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
    hideCreatePolicy(){
      this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
    },
    savePolicy(policy){
      this.controllerFor('data-manager.replication-policies').set('creationInProgress', true);
      this.get('remoteBeaconService').createPolicy(policy).then(()=>{
        this.store.query('policy', {'fields':'tags,clusters,frequency,starttime,endtime,status'}).then((policies)=>{
          this.controllerFor('data-manager.replication-policies').set('model.policies', policies);
          this.controllerFor('data-manager.replication-policies').set('createPolicyShown', false);
          this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        });
      }).catch((e)=>{
        this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        console.error("Policy creation failed", e);
        this.controllerFor('data-manager.replication-policies').set('error', {message: 'Failed to create policy'});
      });
    },
    schedule(policy) {
        this.controllerFor('data-manager.replication-policies').set('creationInProgress', true);
      this.get('remoteBeaconService').schedulePolicy(policy).then(()=>{
        this.store.query('policy', {'fields':'tags,clusters,frequency,starttime,endtime,status'}).then((policies)=>{
          this.controllerFor('data-manager.replication-policies').set('model.policies', policies);
          this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        });
      }).catch((e)=>{
        this.controllerFor('data-manager.replication-policies').set('creationInProgress', false);
        console.error("Policy suspend - failed", e);
      });
    },
    suspend(policy) {
      this.get('remoteBeaconService').suspendPolicy(policy).then(()=>{
        this.refresh();
      }).catch((e)=>{
        console.error("Policy suspend - failed", e);
      });
    },
    resume(policy) {
      this.get('remoteBeaconService').resumePolicy(policy).then(()=>{
        this.refresh();
      }).catch((e)=>{
        console.error("Policy resume - failed", e);
      });
    },
    delete(policy) {
      this.get('remoteBeaconService').deletePolicy(policy).then(()=>{
        this.refresh();
      }).catch((e)=>{
        console.error("Policy delete - failed", e);
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
