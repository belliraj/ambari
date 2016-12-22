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
import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  name : DS.attr('string'),
  policyName : DS.attr('string'),
  type : DS.attr('string'),
  startTime : DS.attr('string'),
  endTime : DS.attr('string'),
  duration : DS.attr('string'),
  status : DS.attr('string'),
  message : DS.attr('string'),
  durationString : Ember.computed('duration', function(){
    return `${(parseInt(this.get('duration'))/60000).toFixed(4)} Minute(s)`;
  }),
  startTimeString : Ember.computed('startTime', function(){
    return new Date(parseInt(this.get('startTime')));
  })
});
