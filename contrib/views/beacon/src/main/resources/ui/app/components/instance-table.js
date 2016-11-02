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

export default Ember.Component.extend({
  showLastRuns : true,
  groupedInstances : Ember.computed('instances.[]', function() {
    var groupedInstances = Ember.A([]);
    this.get('instances.entity').forEach((instance) => {
      var item = groupedInstances.findBy('policyName', instance.policy.name);
      if(Ember.isEmpty(item)){
        groupedInstances.pushObject({policyName : instance.policy.name, instances : [instance]});
      }else{
        item.instances.pushObject(instance);
      }
    });
    return groupedInstances;
  }),
  lastRuns : Ember.computed('groupedInstances.[]', function() {
    var lastRuns = Ember.A([]);
    this.get('groupedInstances').forEach((group) => {
      lastRuns.pushObject(group.instances.findBy('status', 'RUNNING'));
    });
    return lastRuns;
  }),
  actions : {
    viewPreviousRuns(policyName){
      var group = this.get('groupedInstances').findBy('policyName', policyName);
      var previousRuns = group.instances.filter((instance)=>{
        return instance.status !== 'RUNNING';
      });
      this.set('previousRuns', previousRuns);
      this.set('showPreviousRuns', true);
      this.set('showLastRuns', false);
      this.set('selectedPolicy', policyName);
    },
    backToInstances(){
      this.set('showPreviousRuns', false);
      this.set('showLastRuns', true);
      this.set('selectedPolicy', undefined);
      this.set('previousRuns', []);
    }
  }
});
