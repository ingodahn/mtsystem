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
            let newMap={nodes: [], links: []};
            this.map.nodes.forEach(node => {
                newMap.nodes.push({
                    id: node.id,
                    title: node.title,
                    color: node.color,
                    isNew: node.isNew,
                    val: node.val
                });
            });
            this.map.links.forEach(link => {
                newMap.links.push({
                    source: link.source.id,
                    target: link.target.id
                });
            });
            var expString=JSON.stringify(newMap);
            var FileSaver=require('file-saver');
            var blob=new Blob([expString], {type: "text/plain;charset=utf-8"})
            FileSaver.saveAs(blob,"graph.json");
        }
    },
}
</script>