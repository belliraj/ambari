import Ember from 'ember';

export default Ember.Service.extend({
  breadcrumbs : Ember.A([]),
  routeMap : new Map(),
  init () {
    this.get('routeMap').set('data-manager', 'Data Manager');
    this.get('routeMap').set('replication-policies', 'Replication Policies');
    this.get('routeMap').set('replication-setup', 'Replication Setup');
    this.get('routeMap').set('monitor', 'Dashboard');
    this.get('routeMap').set('incoming-policies', 'Incoming Policies');
  },
  showBreadcrumbs(route){
    this.get('breadcrumbs').clear();
    var routeNames = route.routeName.trim().split('.');
    routeNames.forEach((value, index)=>{
      var route = routeNames.slice(0, index+1).join(".");
      this.get('breadcrumbs').pushObject({route : route, displayName : this.get('routeMap').get(value)});
    }, this);
  },
  updateBreadcrumbs(name){
    this.get('breadcrumbs').pushObject({displayName : name});
  }
});
