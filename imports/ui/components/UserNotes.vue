<template>
<div class="container">
    <h2>My Notes on <em>{{title}}</em></h2>
    <v-radio-group v-model="currentNote.status" row>
        <v-radio name="currentNote.status" label="Known" value="100"></v-radio>
        <v-radio name="currentNote.status" label="Exploring" value="2"></v-radio>
        <v-radio name="currentNote.status" label="Interesting" value="150" color="red"></v-radio>
        <v-radio name="currentNote.status" label="Other" value="0"></v-radio>
    </v-radio-group>
            
    <v-textarea
        outlined
        label="Notes:"
        v-model="currentNote.note"
    ></v-textarea>
    <v-btn @click="saveNote">Save</v-btn>
</div>
</template>

<script>
export default {
    props: ['title','currentNote'],
    mounted () {
    },
    methods: {
        saveNote () {
            if (this.currentNote._id) Meteor.call('updateItem',this.currentNote);
            else Meteor.call('insertItem',this.currentNote);
        }
    }
}
</script>