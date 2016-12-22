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
  breadcrumbService : Ember.inject.service('breadcrumb-service'),

  model(){
    return Ember.RSVP.hash({
       policies : this.store.query('policy', {'fields':'tags,clusters,frequency,starttime,endtime,status'}),
       beaconSourceCluster : this.store.peekRecord('cluster', this.modelFor('data-manager').currentCluster.get('name'))
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
  },
  actions : {
    didTransition(){
      this.get('breadcrumbService').showBreadcrumbs(this);
    }
  }
});