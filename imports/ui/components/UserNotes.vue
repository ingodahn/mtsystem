<template>
<div class="container">
    <h2>My Notes on <em>{{title}}</em> <v-btn color= "primary" @click="saveNote">Save</v-btn></h2>
    <v-radio-group v-model="currentNote.status" row>
        <v-radio name="currentNote.status" label="Known" value="100"></v-radio>
        <v-radio name="currentNote.status" label="Exploring" value="2"></v-radio>
        <v-radio name="currentNote.status" label="Interesting" value="150" color="red"></v-radio>
        <v-radio name="currentNote.status" label="Other" value="0"></v-radio>
    </v-radio-group>
    <quill-doc v-if="mode == 'quill'" ref="quillDoc" :content="currentNote.note" v-on:content="updateNote"></quill-doc>
    <div v-if="mode == 'graph'">
        <v-textarea
            outlined
            label="Notes:"
            v-model="currentNote.note"
        ></v-textarea>
    </div>
    
</div>
</template>

<script>
import QuillDoc from "./QuillDoc/QuillDoc.vue";
export default {
  components: { QuillDoc },
    props: ['title','currentNote'],
    components: {QuillDoc},
    data () {
        return {
            mode: 'quill',
        }
    },
    mounted () {
    },
    methods: {
        saveNote () {
            this.$refs.quillDoc.sendContent();
        },
        updateNote (content) {
            this.currentNote.note = content;
            if (this.currentNote._id) Meteor.call('updateItem',this.currentNote);
            else Meteor.call('insertItem',this.currentNote);
        }
    },
}
</script>