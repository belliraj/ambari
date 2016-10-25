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
  redirect(model) {
    if(this.get('router.url') != '/data-manager'){
      return;
    }
    if(model.registeredClusters.totalResults > 1 && model.policies.totalResults >= 0){
      this.transitionTo('data-manager.replication-policies');
    } else {
      model.showInitialLaunch = true;
    }
  },
  model(){
    var clusterRegisteredPromise = this.get('beaconService').getRegisteredClusters();
    var policiesPromise = this.get('beaconService').getPolicies();
    var currentClusterPromise = this.get('beaconViewService').getLocalClusterInfo();
    return Ember.RSVP.hash({
      registeredClusters : clusterRegisteredPromise,
      policies : policiesPromise,
      currentCluster : currentClusterPromise
    });
  },
  actions : {
    goToHomePage(){
      this.refresh();
    },
    setup(){
      Ember.set(this.modelFor('data-manager'),'showInitialLaunch', false);
      this.transitionTo('data-manager.replication-setup');
    },
    didTransition(){
      if(this.get('router.url') != '/data-manager'){
        Ember.set(this.modelFor('data-manager'), 'showInitialLaunch', false);
      }
    }
  }
});
