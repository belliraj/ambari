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
    if(model.registeredClusters.length > 0 && model.policies.length >= 0){
      this.transitionTo('data-manager.replication-policies');
    } else {
      this.transitionTo('data-manager.replication-setup');
    }
  },
  model(){
    var deferred = Ember.RSVP.defer();
    var clusterRegisteredPromise = this.get('beaconService').getRegisteredClusters();
    var policiesPromise = this.get('beaconService').getPolicies();
    var currentClusterPromise = this.get('beaconViewService').getLocalClusterInfo();
    return Ember.RSVP.hash({
      registeredClusters : clusterRegisteredPromise,
      policies : policiesPromise,
      currentCluster : currentClusterPromise
    });
    // deferred.resolve(promise);
    // return deferred.promise;
  },
  actions : {
    goToHomePage(){
      this.refresh();
    }
  }
});
