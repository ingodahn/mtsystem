<template>
  <v-app>
    
    <v-app-bar app>
      <v-btn color="primary" @click="page='home'">Home</v-btn>
      <v-btn color="primary" @click="launchAny('subject')">Subjects</v-btn>
      <v-btn color="primary" @click="launchAny('concept')">Concepts</v-btn>
      <v-btn color="primary" @click="launchAny('theorem')">Theorems</v-btn>
      <v-btn color="primary" @click="launchAny('person')">Persons</v-btn>
      <v-btn color="secondary" @click="page='toc'" v-if="currentUser && (currentUser.username == 'dahn' || currentUser.username == 'editor')">TOC</v-btn>
       <v-btn color="secondary" @click="launchCockpit()" v-if="currentUser && currentUser.username == 'dahn'">Cockpit</v-btn>
      <v-btn color="warning" @click="page='admin'" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      <div class="loading" v-if="!$subReady.units">Loading...</div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <home v-if="page=='home'"></home>
        <admin v-else-if="page=='admin'"></admin>
        <toc v-else-if="page=='toc'"></toc>
        <cockpit v-else-if="page=='cockpit'" v-on:explore="explore"></cockpit>
        <any :key="page" v-else></any>
        <!--
        <router-view></router-view>
        -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import Home from '/imports/ui/views/Home/Home.vue'
  import Admin from '/imports/ui/views/Admin/Admin.vue'
  import Toc from '/imports/ui/views/Toc/Toc.vue'
  import Any from '/imports/ui/views/Any.vue'
  import Cockpit from '/imports/ui/views/Cockpit.vue'
  import {relations, defaultType, defaultRelation, defaultNode} from '/imports/config.js'
  
  export default {
    data() {
      return {
        page: 'home',
        session: {
          type: defaultType,
          relation: defaultRelation[defaultType],
          id: 'none', // will be set in cockpit
          mode: 'view', // view, edit, create
          view: '3D',
          newNodes: 7,
          debug: false,
          set (item,newValue) {
            if (this.debug) console.log('Session setting', item,'to',newValue)
            this[item] = newValue;
          }
        }
      }
    },
    
    components: {
      Home,
      Admin,
      Toc,
      Any,
      Cockpit
    },
    methods: {
      launchAny(t) {
        this.session.type=t;
        this.session.edit=false;
        this.session.id=defaultNode;
        this.page=t;
      },
      launchCockpit() {
        this.session.type='subject';
        this.session.edit=false;
        this.session.id='';
        this.page='cockpit';
      },
      explore(id) {
        console.log('App explore',id)
        this.session.set('id', id);
        this.session.set('mode', 'single');
        this.page=id;
      }
    },
    meteor: {
      $subscribe: {
        'units': [],
        'notes': []
      },
      currentUser() {
        return Meteor.user();
      }
    }
  };
</script>

<style>

</style>
