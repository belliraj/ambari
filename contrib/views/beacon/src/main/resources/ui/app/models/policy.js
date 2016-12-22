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
import DS from 'ember-data';

export default DS.Model.extend({
  name : DS.attr('string'),
  sourceclusters  : DS.attr(''),
  targetclusters : DS.attr(''),
  type : DS.attr('string'),
  tags : DS.attr(''),
  frequency : DS.attr('string'),
  sourceCluster : Ember.computed('sourceclusters.[]', function(){
    return this.get('sourceclusters').join();
  }),
  targetCluster : Ember.computed('targetclusters.[]', function(){
    return this.get('targetclusters').join();
  }),
  status : DS.attr('string'),
  frequencyString : Ember.computed('frequency', function(){
    if(parseInt(this.get('frequency')) === 3600){
      return "Every Hour";
    }else if(parseInt(this.get('frequency')) === 86400){
      return "Every Day";
    }else if(parseInt(this.get('frequency')) === 604800){
      return "Every Week";
    }else if(parseInt(this.get('frequency')) === 2628000){
      return "Every Month";
    }else{
      return `Every ${parseInt(this.get('frequency'))/60} Minute(s)`;
    }
  })
});
