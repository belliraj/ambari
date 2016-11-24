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
  groupedClusters : Ember.computed('registeredClusters.[]', function(){
    var groupedClusters = Ember.A([]);
    this.get('registeredClusters').forEach((cluster) => {
      var item = groupedClusters.findBy('dataCenter', cluster.get('dataCenter'));
      if(Ember.isEmpty(item)){
        groupedClusters.pushObject({dataCenter : cluster.get('dataCenter'), clusters : [cluster]});
      }else{
        item.clusters.pushObject(cluster);
      }
    });
    return groupedClusters;
  }),
  onUpdate : function(){
    this.$('.list-group .collapse').collapse('show');
  }.on('didUpdate'),
  rendered : function(){
      this.$('.list-group .collapse').collapse('show');
  }.on('didInsertElement')
});
