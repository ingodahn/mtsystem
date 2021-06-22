<template>
    <div v-html="content"></div>
</template>

<script>
export default {
    props: ["content"],
    mounted: function() {
        console.log("element mounted...");
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    },
}
</script>