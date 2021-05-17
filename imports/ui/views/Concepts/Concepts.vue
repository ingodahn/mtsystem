<template>
    <div class="container">
        <h1>MathTrek Concepts</h1>
        <div v-if="mode == 'list'">
            <v-btn id="btnNew" @click="newConcept">New Concept</v-btn>
            <span v-if="current._id">
                | <v-btn id="btnUpdate" @click="mode='update'">Update Concept</v-btn>
            </span>
            <div data-app>
            <v-autocomplete
                label="Select Concept"
                v-model="current"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                return-object
                clearable
            ></v-autocomplete>
            </div>
            <br/>
            <div v-if="current.description" v-html="current.description"></div>
            <div v-if="current.see">
                <a :href="current.see" target="_blank">Read more</a>
            </div>
            <v-list v-if="current._id && current.below">
                <v-subheader>Subconcept of</v-subheader>
                <v-list-item-group>
                    <v-list-item v-for="(item,index) in currentSuperConcepts" 
                    :key="index" @click="setCurrentBelow(index)">
                        
                        <v-list-item-content>
                            <v-list-item-title v-text="item"></v-list-item-title>
                        </v-list-item-content>
                            
                    </v-list-item>
                </v-list-item-group>
            </v-list>

            <v-list v-if="current._id && currentSub.length">
                <v-subheader>Superconcept of</v-subheader>
                <v-list-item-group>
                    <v-list-item v-for="(item,index) in currentSubConcepts" 
                    :key="index" @click="setCurrentAbove(index)">
                        
                        <v-list-item-content>
                            <v-list-item-title v-text="item"></v-list-item-title>
                        </v-list-item-content>
                            
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </div>
        <div v-else>
            <h2>Edit Concept</h2>
            <v-btn @click="mode='list'">Cancel</v-btn> | 
            <v-btn @click="saveConcept">Save</v-btn> | 
            <v-btn v-if = "current._id" @click="deleteConcept">Delete</v-btn>
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
            <div data-app>
            <v-autocomplete
                label="Subconcept of"
                v-model="current.below"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                clearable
                deletable-chips
                multiple
                small-chips
            ></v-autocomplete>
            </div>
            <v-text-field
                label="See:"
                hide-details="auto"
                v-model="current.see"
            ></v-text-field>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";

export default {
    data() {
        return {
          current: {
                type: "concept",
                title: "",
                description: "",
                below: [],
                see: ""
            },
          mode: "list",
        };
    },
    methods: {
        newConcept () {
            this.current= {
                type: "concept",
                title: "",
                description: "",
                see: ""
            };
            this.mode="select";
        },
        saveConcept () {
            console.log(this.current);
            this.current.updatedAt = new Date();
            if (this.current._id) {
                UnitsCollection.update(
                    {_id: this.current._id},
                    {
                    $set: this.current
                    }
                )
            } else  {
                UnitsCollection.insert(this.current);
            }
            this.closeConceptUpdate ();
        },
        deleteConcept () {
            if (this.current._id) {
                UnitsCollection.remove(this.current._id);
            } else {
                alert("Not yet in database, cannot delete.");
            }
            this.closeConceptUpdate ();
        },
        closeConceptUpdate () {
            this.current= {
                type: "concept",
                title: "",
                description: "",
                below: [],
                see: ""
            };
            this.mode="list";
        },
        setCurrentBelow (i) {
            this.current = this.currentSuper[i];
        },
        setCurrentAbove (i) {
            this.current = this.currentSub[i];
        }
    },
    computed: {
        // Concepts of which the current concept is a superconcept
        currentSuper () {
            return UnitsCollection.find(
                {
                    type: "concept",
                    _id: {$in: this.current.below}}
            ).fetch();
        },
        currentSuperConcepts () {
            
            return this.getCurrentSupers.map(c => c.title);
        },
        getCurrentSupers () {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: 'isBelow',
                source: this.current._id
            }).fetch().map(d => d.target);
            rs=UnitsCollection.find({_id: {$in: rds}});
            console.log(rs);
            return rs;
        },
        // Concepts of which the current concept is a subconcept
        currentSub () {
            return UnitsCollection.find(
                {
                    type: "concept",
                    below: this.current._id
                }
            ).fetch();
        },
        currentSubConcepts () {
            return this.currentSub.map(c => c.title);
        }
    },
    meteor: {
      all() {
        return UnitsCollection.find(
            {type: "concept"}
        ).fetch();
      }
    }
}
</script>

<style scoped>
div >>> p {
    margin-bottom: 0.5em;
}

.item:hover {
  background-color: greenyellow;
}
</style>