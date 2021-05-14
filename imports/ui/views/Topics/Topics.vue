<template>
    <div class="container">
        <h1>MathTrek Topics</h1>
        <div v-if="mode == 'list'">
            <div>
                <v-btn id="btnAll" @click="searchTerm=''">New Search"</v-btn>
                <v-btn id="btnNew" @click="newTopic">New Topic</v-btn>
                <v-text-field
                    label="Search (at least 3 letters):"
                    hide-details="auto"
                    v-model="searchTerm"
                ></v-text-field>
            </div>
            <div v-if="searchTerm.length > 2">
                <ul v-if="found.length > 0">
                    <li class="item"
                    v-for="item in found" v-bind:key="item._id"
                    v-on:click="currentTopic=item;mode='select'">
                        {{ item.title }}
                    </li>
                </ul>
                <div v-else>
                    No items found.
                </div>
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
          searchTerm: ""
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
      found() {
        if (this.searchTerm.length < 3) return [];
        return UnitsCollection.find({$and: [
            {type: "topic"},
            {title: {$regex: this.searchTerm, $options: 'i'}}
        ]}).fetch();
      }
    }
}
</script>

<style scoped>
.v-text-field{
      width: 400px;
}

.item:hover {
  background-color: greenyellow;
}
</style>