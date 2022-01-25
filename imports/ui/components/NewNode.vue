<template>
  <v-container>
    <v-layout row>
      <v-row>
        <v-col xs="12" md="8">
          <v-btn color="warning" @click="cancel">Cancel</v-btn>
          <v-btn color="accent" @click="save">Save</v-btn>
          <v-text-field
            label="Title"
            hide-details="auto"
            v-model="current.title"
          ></v-text-field>
          <v-textarea
            outlined
            label="Description:"
            v-model="current.description"
          ></v-textarea>
          <v-textarea
            outlined
            label="Show more:"
            v-model="current.readMore"
          ></v-textarea>
          <v-text-field
            label="See:"
            hide-details="auto"
            v-model="current.see"
          ></v-text-field>
        </v-col>
        <v-col xs="12" md="4">
          <v-select
            :items="myRelations"
            item-text = 'name'
            item-value = 'id'
            label="Select relation to edit"
            v-model="currentRelation"
          />
          <v-autocomplete
            label="Targets:"
            v-model="updateRelations[currentRelation]"
            hide-details="auto"
            :items="typeNodes"
            item-text="title"
            item-value="_id"
            clearable
            deletable-chips
            multiple
            small-chips
          ></v-autocomplete>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import { Random } from "meteor/random";

export default {
  props: ["relations","id"],
  data() {
    return {
      session: this.$root.$data.session,
      current: {
        title: "NEW ENTRY - please, edit",
        type: "",
        description: "",
        readMore: "",
        see: "",
      },
      currentRelation: "",
      updateRelations: {},
    };
  },
  components: {},
  methods: {
    cancel() {
      //this.$emit('new','');
      this.session.set("edit", false);
    },
    updatedRelations(Rels) {
      this.updateRelations = Rels;
    },
    save() {
      let newDate = new Date();
      this.current.updatedAt = newDate;
      this.current.type = this.session.type;
      if (this.id) {
          this.current._id=this.id;
          Meteor.call("updateItem", this.current);
      } else {
        this.current._id=Random.id([17]);
        Meteor.call("insertItem", this.current);
      }
      
      Object.keys(this.updateRelations).forEach((rid) => {
        Meteor.call("deleteItem", {
          type: "relation",
          name: rid,
          source: this.current._id,
        });
        this.updateRelations[rid].forEach((tid) => {
          Meteor.call("insertItem", {
            type: "relation",
            name: rid,
            source: this.current._id,
            target: tid,
          });
        });
      });
      this.session.set("id", this.current._id,'NewNode-114');
      this.session.set("edit", false);
      this.session.set("mode", "text");
    },
  },
  computed: {
    typeNodes() {
      let t = this.myRelations.find((r) => r.id == this.currentRelation);
      return (t)?UnitsCollection.find({ type: t.targetType }, { sort: { title: 1 } }).fetch():[];
    },
    myRelations() {
      let tr = [];
      this.relations.filter((r) => r.sourceType == this.session.type).forEach((r) => {
        tr.push({
          name: r.name + " " + r.targetType,
          id: r.id,
          targetType: r.targetType,
        });
      });
      return tr;
    },
  },
  mounted() {
    this.current.type = this.session.type;
    this.currentRelation = this.myRelations[0].id;
    let rels={};
    this.myRelations.forEach((r) => {
        rels[r["id"]] = [];
      });
    if (this.id) {
      this.myRelations.forEach((r) => {
        UnitsCollection.find({type: 'relation', name: r['id'], source: this.session.id}).fetch().forEach(rr => {rels[r['id']].push(rr.target)});
      })
      let startNode=UnitsCollection.findOne({_id: this.id})
      this.current.title=startNode.title;
      this.current.description=startNode.description;
      this.current.readMore = startNode.readMore;
      this.current.see = startNode.see;
    }
    this.updateRelations = rels;
  },
};
</script>