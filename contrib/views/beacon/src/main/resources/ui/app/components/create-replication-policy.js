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
  beaconViewService : Ember.inject.service('beacon-view-service'),
  initialize : function(){
    this.set('selectionType', 'all');
    this.set('policy', {});
    this.set('policy.frequencyInSec', 86400);
    this.set('policy.type', 'HIVE');
    this.set('policy.sourceCluster', this.get('currentCluster.name'));
    this.getHiveDbs();
    this.set('policy.aclOwner', this.get('userInfo').name);
    this.set('policy.aclGroup', this.get('userInfo').groupNames.join());
    this.set('policy.aclPermission', '0x755');
  }.on('init'),
  getHiveDbs(){
    this.set('requestInProcess', true);
    this.set('hiveError', false);
    this.get('beaconViewService').getHiveDbs().done((response)=>{
      this.set('requestInProcess', false);
      var dbs = [];
      response.databases.forEach((name)=>{
        dbs.pushObject({'name':name});
      });
      this.set('hiveDatabases', dbs);
    }).fail((e)=>{
      console.error(e);
      this.set('requestInProcess', false);
      //this.set('hiveError', true);
      //TODO - MOCK
      this.set('hiveDatabases', Constants.MOCK_INFO.hiveDatabases);
    });
  },
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
        this.set('policy.sourceDatabase', this.get('policy.dataset'));
      }else{
        this.set('policy.sourceDir', this.get('policy.dataset'));
        this.set('policy.targetDir', this.get('policy.dataset'));
      }
      this.set('policy.frequencyInSec', 120);
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
    },
    browse(modelProp){
      this.set('showingFileBrowser', true);
    },
    closeFileBrowser(){
      this.set('showingFileBrowser', false);
      this.set('policy.dataset', this.get('filePath'));
    },
    collapseHandler(){
      if(this.$('#advanced-panel').hasClass('in')){
        this.set('collapsed', false);
      }else{
        this.set('collapsed', true);
      }
    },
    policyTypeChanged(type){
      this.set('policy.type', type);
      if(type === 'HDFS'){
        this.set('policy.distcpMaxMaps',1);
        this.set('policy.distcpMapBandwidth',10)
        this.set('policy.tdeEncryptionEnabled',false);
        this.set('policy.preservePermission', true);
      }else{
        delete this.get('policy.distcpMaxMaps');
        delete this.get('policy.distcpMapBandwidth');
        delete this.get('policy.tdeEncryptionEnabled');
        delete this.get('policy.preservePermission');
      }
    },
    getHiveDbs(){
      this.getHiveDbs();
    }
  }
});
