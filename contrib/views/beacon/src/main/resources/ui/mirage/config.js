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
import Constants from '../utils/constants';

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
  Config (with defaults).

  Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
  Shorthand cheatsheet:

  this.get('/posts');
  this.post('/posts');
  this.get('/posts/:id');
  this.put('/posts/:id'); // or this.patch
  this.del('/posts/:id');

  http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
  */
  this.namespace = 'api';
  var currentCluster = 'Sandbox';
  var clusters = {
    primaryCluster : {
      'name':'primaryCluster',
      'description':'primary',
      'colo':'virginia',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    },
    secondaryCluster : {
      'name':'secondaryCluster',
      'description':'secondary',
      'colo':'texas',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    }
  };

  var pairedClusters = {
    primaryCluster : [],
    secondaryCluster : []
  };

  var remoteClustersInfo = {
    primaryCluster : [{
      'name':'secondaryCluster',
      'description':'secondary',
      'colo':'texas',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    }],
    secondaryCluster : [{
      'name':'primaryCluster',
      'description':'primary',
      'colo':'virginia',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    }]
  };

  var registeredClusters = {
    primaryCluster : [],
    secondaryCluster : [{
      'name':'secondaryCluster',
      'description':'secondary',
      'colo':'texas',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    },{
      'name':'primaryCluster',
      'description':'primary',
      'colo':'virginia',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    }]
  };

  var policies = {
    primaryCluster : [],
    secondaryCluster : []
  };

  this.get('/beaconview/localClusterInfo',()=>{
    return {
      'name':'primaryCluster',
      'description':'primary',
      'colo':'virginia',
      'nameNodeUri':'hdfs://localhost:8020',
      'executeUri':'localhost:8021',
      'wfEngineUri':'http://localhost:11000/oozie',
      'messagingUri':'tcp://localhost:61616?daemon=true',
      'hs2Uri':'http://localhost:10000',
      'tags':'consumer=consumer@xyz.com,owner=producer@xyz.com',
      'customProperties':{queue:'default', priority:'high'},
      'acl':{owner:'ambari-qa', group:'users', permission:'0x755'}
    };
  });

  this.get('/beaconview/clusterInfo/:name',(schema, request)=>{
    return remoteClustersInfo[request.params.name];
  });

  this.get('/beaconService/cluster/list',() => {
    return registeredClusters[Constants.MOCK_INFO.localCluster];
  });

  this.get('/beaconService/policy/list',() => {
    return policies[Constants.MOCK_INFO.localCluster];
  });

  this.post('/beaconService/cluster/submit/:name',(schema, request) => {
    var cluster = JSON.parse(request.requestBody);
    registeredClusters[Constants.MOCK_INFO.localCluster].push(cluster);
  });

  this.post('/beaconService/policy/submit/:name',() => {
    policies[Constants.MOCK_INFO.localCluster].push({
      name:'hivePolicy',
      type:'HIVE',
      dataset:'sales',
      sourceCluster:'primaryCluster',
      targetCluster:'backupCluster',
      frequencyInSec:3600,
      tags:'owner:producer@xyz.com',
      component:'sales',
      aclOwner:'ambari-qa',
      aclGroup:'users',
      aclPermission:'0x755',
      retryAttempts:3,
      queue:'default',
      maxEvents:-1
    });
  });
}
