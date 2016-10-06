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
  var currentCluster = 'c2';
  var clusters = {
    'c1' : {id:'c1', name :'Cluster1', datacenter :'DC1'},
    'c2' : {id:'c2', name :'Cluster2', datacenter :'DC2'},
    'c3' : {id:'c3', name :'Cluster3', datacenter :'DC3'},
  };

  var peersInfo = {
    'c1' : [
      {id:'c2', name :'Cluster2', datacenter :'DC2'}
    ],
    'c2' : []
  };

  var remoteClustersInfo = {
    'c1' : [
            {id:'c3', name :'Cluster3', datacenter :'DC3'},
            {id:'c4', name :'Cluster4', datacenter :'DC3'},
            {id:'c5', name :'Cluster5', datacenter :'DC4'}
          ],
    'c2' : [
            {id:'c6', name :'Cluster6', datacenter :'DC6'},
            {id:'c7', name :'Cluster7', datacenter :'DC7'},
            {id:'c8', name :'Cluster8', datacenter :'DC8'}
          ],
    'c3' : []
  };

  this.get('/currentCluster', () => {
    return clusters[currentCluster];
  });

  this.get('/remoteClusters/:clusterId',(schema, request) => {
    return remoteClustersInfo[request.params.clusterId];
  });
  this.post('/remoteClusters/:clusterId',(schema, request) => {
    var cluster = JSON.parse(request.requestBody);
    peersInfo[request.params.clusterId].push(cluster);
  });
  this.get('/peers/:clusterId', (schema, request) => {
    return peersInfo[request.params.clusterId];
  });

  this.get('/policies/:clusterId',(schema, request)=>{
    if(request.params.clusterId === 'c1'){
      return [{id:1, name:'policy-1'}, {id:2, name:'policy-2'}];
    }else{
      return [];
    }
  });
}
