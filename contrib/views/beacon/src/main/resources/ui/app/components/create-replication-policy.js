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
  initialize : function(){
    this.set('selectionType', 'all');
    this.set('policy', {});
    this.set('policy.frequencyInSec', 86400);
    this.set('policy.type', 'HIVE');
    this.set('policy.sourceCluster', this.get('currentCluster.name'));
    this.set('hiveDatabases', Constants.MOCK_INFO.hiveDatabases);
  }.on('init'),
  actions : {
    createPolicy(){
      if(this.get('policy.type') === 'HIVE' && this.get('selectionType') === 'all'){
        this.set('policy.dataset', this.get('hiveDatabases').mapBy('name').join());
      }else if(this.get('policy.type') === 'HIVE' && this.get('selectionType') === 'selected'){
        var selectedDBs = [];
        this.$('input[name="db-name"]:checked').each((i, checkbox) => {
          selectedDBs.push(checkbox.value);
        });
        this.set('policy.dataset', selectedDBs.join());
      }
      this.sendAction("savePolicy", this.get('policy'));
    },
    changeSchedule(type){
      if(type === 'hourly'){
        this.set('policy.frequencyInSec', 3600);
      }else if(type === 'daily'){
        this.set('policy.frequencyInSec', 86400);
      }else if(type === 'weekly'){
        this.set('policy.frequencyInSec', 604800);
      }else if(type === 'monthly'){
        this.set('policy.frequencyInSec', 2628000);
      }
    },
    previous(){
      this.$('#create-policy').find('.active').prev('li').find('a[data-toggle="tab"]').tab('show');
    },
    next(){
      this.$('#create-policy').find('.active').next('li').find('a[data-toggle="tab"]').tab('show');
    },
    onDBSelect(type){
      this.set('selectionType', type);
    }
  }
});
