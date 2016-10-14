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
  selectedTab : 'source',
  onRender : function(){
    this.$('#cluster-initial-dialog').modal({
      backdrop: 'static',
      keyboard: false
    });
    this.$('#cluster-initial-dialog').modal('show');
    this.$('#cluster-initial-dialog').modal().on('hidden.bs.modal', function() {

    }.bind(this));
  }.on('didInsertElement'),
  actions : {
    remoteClusterSelected (clusterName) {
      this.set('selectedCluster', this.get('remoteClusters').findBy('name', clusterName));
    },
    onTabSelect(tab){
      this.set('selectedTab', tab);
    },
    save(){
      var clusters = [];
      clusters.push(this.get('currentCluster'));
      clusters.push(this.get('selectedCluster'));
      this.sendAction('registerClusters', clusters);
      this.$('#cluster-initial-dialog').modal('hide');
    }
  }
});
