<template>
    <div class="container">
        <h1>MathTrek Topics</h1>
        <div v-if="mode == 'list'">
            <v-btn id="btnNew" @click="newTopic">New Topic</v-btn>
            <span v-if="currentTopic._id">
                | <v-btn id="btnUpdate" @click="mode='update'">Update Topic</v-btn>
            </span>
            <div data-app>
            <v-autocomplete
                label="Select Topic"
                v-model="currentTopic"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                return-object
                clearable
            ></v-autocomplete>
            </div>
            <br/>
            <div v-if="currentTopic.description">
                {{ currentTopic.description }}
            </div>
        </div>
        <div v-else>
            <h2>Edit Topic</h2>
            <v-btn @click="mode='list'">Cancel</v-btn> | 
            <v-btn @click="saveTopic">Save</v-btn> | 
            <v-btn v-if = "currentTopic._id" @click="deleteTopic">Delete</v-btn>
            <v-text-field
                label="Title"
                hide-details="auto"
                v-model="currentTopic.title"
            ></v-text-field>
            <v-textarea
                outlined
                label="Description:"
                v-model="currentTopic.description"
            ></v-textarea>
            <div data-app>
            <v-autocomplete
                label="Parent"
                v-model="currentTopic.parent"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                clearable
            ></v-autocomplete>
            </div>
            <v-text-field
                label="Code (optional)"
                hide-details="auto"
                v-model="currentTopic.code"
            ></v-text-field>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";

export default {
    data() {
        return {
          currentTopic: {
                type: "topic",
                title: "",
                description: "",
                code: ""
            },
          mode: "list",
        };
    },
    methods: {
        newTopic () {
            this.currentTopic= {
                type: "topic",
                title: "",
                description: "",
                code: ""
            };
            this.mode="select";
        },
        saveTopic () {
            console.log(this.currentTopic);
            this.currentTopic.updatedAt = new Date();
            if (this.currentTopic._id) {
                UnitsCollection.update(
                    {_id: this.currentTopic._id},
                    {
                    $set: this.currentTopic
                    }
                )
            } else  {
                UnitsCollection.insert(this.currentTopic);
            }
            this.closeTopicUpdate ();
        },
        deleteTopic () {
            if (this.currentTopic._id) {
                UnitsCollection.remove(this.currentTopic._id);
            } else {
                alert("Not yet in database, cannot delete.");
            }
            this.closeTopicUpdate ();
        },
        closeTopicUpdate () {
            this.currentTopic= {
                type: "topic",
                title: "",
                description: "",
                code: ""
            };
            this.mode="list";
        }
    },
    computed: {

    },
    meteor: {
      all() {
        return UnitsCollection.find(
            {type: "topic"}
        ).fetch();
      }
    }
}
</script>

<style scoped>

.item:hover {
  background-color: greenyellow;
}
</style>