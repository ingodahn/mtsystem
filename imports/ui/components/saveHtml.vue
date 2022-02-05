<template>
    <v-container>
        <v-btn color="primary" @click="saveHtml">Save as HTML</v-btn>
    </v-container>
</template>

<script>
export default {
    data () {
        return {
            head: `<!DOCTYPE html>
            <html lang="en">
            `,
            html: ''
        }
    },
    methods: {
        saveHtml () {
            this.html = this.$refs.editor.getHtml()
            this.$refs.saveHtml.show()
        }
    }
}
</script>