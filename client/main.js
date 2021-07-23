import Vue from 'vue'
import router from './routes';
import VueMeteorTracker from 'vue-meteor-tracker';
import '/imports/api/methods/UnitsCollectionMethods';

Vue.use(VueMeteorTracker);

import Vuetify from 'vuetify'; 
import 'vuetify/dist/vuetify.min.css';
import VMarkdown from 'v-markdown/src';
 
Vue.use(VMarkdown);
Vue.use(Vuetify); // this is all you need for Vuetify 1.x

import '../imports/ui/plugins'

import App from '../imports/ui/App.vue';

// for Vuetify 2.x you also need:
const vuetify = new Vuetify({});
/*
import { Template } from 'meteor/templating';
Template.registerHelper('gCurrentId', function () { return Session.get('currentId') });
*/

Meteor.startup(() => {
  new Vue({
    router,
    el: '#app',
    vuetify, // this bit is also needed for Vuetify 2.x
    ...App,
  })
})
