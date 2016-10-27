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

export default Ember.Service.extend({
  baseUrl : Ember.ENV.API_URL,
  getLocalClusterInfo(){
    var url = this.get('baseUrl') + '/localClusterDetails';
    return Ember.$.get(url);
  },
  getRemoteClusterInfo(ambariUrl, auth){
    var url = this.get('baseUrl') + '/remoteClusterDetails?ambariUrl=' + ambariUrl;
    return Ember.$.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(auth),
      dataType: 'json'
    });
  },
  getRemoteClusters(){
    var url = this.get('baseUrl') + '/listRemoteClusters';
    return Ember.$.get(url);
  },
  isRegisteredInBeacon(){
    return Constants.MOCK_INFO.isRegisteredInBeacon;
  },
  pairCluster(clusterName){
    var url = this.get('baseUrl') + '/pair/' + clusterName;
    return Ember.$.post(url);
  }
});
