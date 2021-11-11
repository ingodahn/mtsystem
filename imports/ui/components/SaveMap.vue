<template>
    <div>
        <v-btn @click="saveMap()">Save Map</v-btn>
    </div>
</template>

<script>
export default {
    props: {
        map: {
            type: Object,
            required: true
        }
    },
    methods: {
        saveMap() {
            var expString=JSON.stringify(this.map);
            var FileSaver=require('file-saver');
            var blob=new Blob([expString], {type: "text/plain;charset=utf-8"})
            FileSaver.saveAs(blob,"mtData.js");
        }
    },
}
</script>