<template>
  <v-container>
    <v-row v-if="session.id">
      <v-col xs="12" md="8">
        <v-row>
          <show-math-doc
            :key="current.description"
            v-if="current.description"
            :content="current.description"
          ></show-math-doc>
        </v-row>
        <v-row v-if="current.readMore">
          <v-btn v-if="!showMore" @click="showMore = true">Show more...</v-btn>
          <show-math-doc
            :key="current.readMore"
            v-if="showMore"
            :content="current.readMore"
          ></show-math-doc>
        </v-row>
        <v-row v-if="showMore">
          <v-btn @click="showMore = false">Show less</v-btn>
        </v-row>
        <v-row v-if="current.see" class="wiki">
          <a :href="current.see" target="_blank">See also</a>
        </v-row>
        <v-row class="wiki">
          <a :href="wikiUrl" target="_blank">MathTrek-Wiki</a> (comments,
          discussions)
        </v-row>
      </v-col>
      <v-col xs="12" md="4">
        <div v-if="currentRelation.sourceType == session.type">
          <v-select
            v-if="getCurrentNodeIsSource(currentRelation.id).length"
            :items="getCurrentNodeIsSource(currentRelation.id)"
            :label="current.title + ' ' + currentRelation.name"
            item-text="title"
            item-value="_id"
            v-model="selectedTarget"
            return-object
            hide-details="auto"
          ></v-select>
          <p v-else>
            {{ current.title }} {{ currentRelation.name }} no
            {{ currentRelation.targetType }} in this system.
          </p>
        </div>
        <div v-if="currentRelation.targetType == session.type">
          <v-select
            v-if="getCurrentNodeIsTarget(currentRelation.id).length"
            :items="getCurrentNodeIsTarget(currentRelation.id)"
            :label="current.title + ' ' + currentRelation.inverse"
            item-text="title"
            item-value="_id"
            v-model="selectedSource"
            return-object
            hide-details="auto"
          ></v-select>
          <p v-else>
            {{ current.title }} {{ currentRelation.inverse }} no
            {{ currentRelation.sourceType }} in this system.
          </p>
        </div>
        <Sidebar :title="current.title" :relations="relations" mode="text"/>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-row>
        <v-col md="12">
          <h3>Select a {{session.type}} typing into the selection above or</h3>
        <div>
          <v-list>
            <v-subheader>Try one of our top {{topTen.length}} {{ session.type }}s:</v-subheader>
            <v-list-item v-for="item in topTen" :key="item.id" @click="session.id=item.id">
              {{ item.title }}
            </v-list-item>
          </v-list>
        </div>
          </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import ShowMathDoc from "./ShowMathDoc.vue";
//import UserNotes from "./UserNotes.vue";
import Sidebar from "./Sidebar1.vue";

export default {
  props: ["relations"],

  data() {
    return {
      session: this.$root.$data.session,
      current: { title: "Default title" },
      selectedSource: [],
      selectedTarget: [],
      showMore: false,
    };
  },

  components: {
    ShowMathDoc,
    Sidebar
    //UserNotes
  },
    watch: {
        selectedSource: function(n) {
            this.selected(n);
        },
        selectedTarget: function(n) {
            this.selected(n);
        }
    },
  mounted() {
    const myCurrent = UnitsCollection.findOne({ _id: this.currentId });
    if (myCurrent) {
      this.current = myCurrent;
    }
  },
  methods: {
    id2relation(id) {
      console.log('ShowOne-110',this.relations);
      return this.relations.find((e) => e.id == id);
    },
    getRelationDescription(relation) {
      let ctype = this.session.type.charAt(0).toUpperCase() + this.session.type.substring(1);
      let source = this.current.title;
      let target = ctype + " 2";

      return (
        '"' +
        source +
        " " +
        relation.name +
        " " +
        target +
        '" means: ' +
        relation.description
          .replaceAll("SOURCE", source)
          .replaceAll("TARGET", target)
      );
    },
     // Concepts of which the current node is a target
    getCurrentNodeIsTarget (relationId) {
        const rds = UnitsCollection.find({
            type: 'relation',
            name: relationId,
            target: this.session.id
        }).fetch().map(d => d.source);
        this.currentAbove=rds;
        rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
        return rs;
    },
    // Concepts of which the current node is a source
    getCurrentNodeIsSource (relationId) {
        let session=this.$root.$data.session;
        const rds = UnitsCollection.find({
            type: 'relation',
            name: relationId,
            source: session.id
        }).fetch().map(d => d.target);
        this.currentBelow=rds;
        rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
        return rs;
    },
    getCurrent() {
      let cu = UnitsCollection.findOne({ _id: this.currentId });
      if (cu) return cu;
      console.log(this.currentId + " not found");
      return {};
    },
    selected (doc) {
        this.session.set('id',doc._id);
        this.session.set('type',doc.type);
        this.session.set('edit',false);
    },
    nodeVal(nid) {
      return UnitsCollection.find({$or: [{target: nid, type: 'relation'},{source: nid, type: 'relation'}]}).fetch().length;
    }
  },
  computed: {
    currentRelation() {
      return this.relations.find(r => r.id==this.session.relation);
    },
    currentId() {
      return this.session.id;
    },
    /*
    type() {
      return this.session.type;
    },
    */
    wikiUrl() {
      const base = "https://wiki.mathtrek.eu?title=";
      let title = this.current.title.replaceAll(" ", "_");
      title = title.replaceAll("'", "%27");
      title = title.replaceAll("^", "%5E");
      return base + title;
    },
    topTen () {
      let tt=[];
      UnitsCollection.find({type: this.session.type}).fetch().forEach(n => {tt.push({id: n._id, title: n.title, val: this.nodeVal(n._id)})});
      return tt.sort((a,b) => {return (a.val < b.val)?1:-11}).slice(0,10);
    }
  },
  meteor: {
      currentUser() {
            return Meteor.user();
        }
  },
};
</script>

<style scoped>
.wiki {
  margin-top: 1em;
}
</style>