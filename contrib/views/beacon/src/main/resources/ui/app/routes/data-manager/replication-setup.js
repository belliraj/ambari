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
  breadcrumbService : Ember.inject.service('breadcrumb-service'),

  setupController: function(controller, model) {
    this._super(controller, model);
  },

  afterModel(model){
    model.currentCluster = this.modelFor('data-manager').currentCluster;
    model.registeredClusters = this.modelFor('data-manager').registeredClusters;
  },

  model(){
    return Ember.RSVP.hash({
      remoteClusters : this.store.query('ambari-cluster', {remote : true})
    });
  },

  actions : {
    setup(){
      this.controllerFor('data-manager.replication-setup').set('showClusterPopup', true);
    },
    refresh(){
      Ember.getOwner(this).lookup('route:data-manager').refresh();
    },
    onError(error){
      this.controllerFor('data-manager.replication-setup').set('error', error);
    },
    showStatus(status){
      this.controllerFor('data-manager.replication-setup').set('status', status);
    },
    update(){
      this.store.query('cluster', {'fields':'peers'}).then(()=>{
        this.controllerFor('data-manager.replication-setup').set('model.registeredClusters', this.store.peekAll('cluster'));
        Ember.getOwner(this).lookup('route:data-manager').controller.set('model.registeredClusters', this.store.peekAll('cluster'));
      });
    },
    didTransition(){
      this.get('breadcrumbService').showBreadcrumbs(this);
    }
  }
});
