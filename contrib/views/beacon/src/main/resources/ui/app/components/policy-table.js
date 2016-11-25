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
import Constants from '../utils/constants';

export default Ember.Component.extend({
  beaconService : Ember.inject.service('beacon-service'),
  remoteBeaconService : Ember.inject.service('remote-beacon-service'),
  start : Ember.computed('offset', function(){
    if(!this.get('offset')){
      return 1;
    }
    return parseInt(this.get('offset')) + 1;
  }),
  end : Ember.computed('start', function(){
    return parseInt(this.get('start')) + parseInt(this.get('policies.length')) - 1;
  }),
  noOfPages : Ember.computed('policies.meta.totalResults', function(){
    return this.get('policies.meta.totalResults') / Constants.PAGINATION.pageSize;
  }),
  pages : Ember.computed('noOfPages', function(){
    var pages = Ember.A([]);
    for(let i=0;i < this.get('noOfPages');i++){
      pages.pushObject({index:i, displayIndex : i+1});
    }
    return pages;
  }),
  currentPage : Ember.computed('start', function(){
    return parseInt(this.get('start') / Constants.PAGINATION.pageSize) + 1;
  }),
  sourcePolicies : Ember.computed('policies.[]', function(){
    return this.get('policies').filterBy('sourceCluster', this.get('beaconSourceCluster.name'));
  }),
  incomingPolicies : Ember.computed('policies.[]', function(){
    return this.get('policies').filterBy('targetCluster', this.get('beaconSourceCluster.name'));
  }),
  initialize : function(){
    if(this.get('type') === 'source'){
      this.set('policyList', this.get('sourcePolicies'));
    }else{
      this.set('policyList', this.get('incomingPolicies'))
    }
  }.on('init'),
  actions : {
    createPolicy(){
      this.sendAction('createPolicy');
    },
    goToPage(index){
      this.sendAction('goToPage', {'offset' : index * Constants.PAGINATION.pageSize});
    },
    previous(currentPage){
      this.sendAction('goToPage', {'offset' : (currentPage - 2) * Constants.PAGINATION.pageSize});
    },
    next(currentPage){
      this.sendAction('goToPage', {'offset' : (currentPage) * Constants.PAGINATION.pageSize});
    },
    schedule(policy) {
      this.sendAction('schedule', policy);
    },
    suspend(policy) {
      this.sendAction('suspend', policy);
    },
    resume(policy) {
        this.sendAction('resume', policy);
    },
    delete(policy) {
      this.sendAction('delete', policy);
    },
    viewInstances(policy){
      this.set('requestInProcess', true);
      this.set('selectedPolicy', policy);
      this.get('remoteBeaconService').getAllInstances(policy).then((response)=>{
        this.set('requestInProcess', false);
        this.set('showingInstances', true);
        this.set('instances', response.instance);
      }.bind(this)).catch(()=>{
        this.set('requestInProcess', false);
      }.bind(this));
    },
    backToPolicies(){
      this.set('showingInstances', false);
    }
  }
});
