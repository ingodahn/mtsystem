<template>
<div class="container">
    <div id="editor"></div>
</div>
</template>

<script>
var myQuill={}, ct=this.content;
export default {
    props: ["content"],
    data () {
        return {
            operators: [["\\pm","\\pm"],["\\sqrt{x}","\\sqrt"],["\\sqrt[3]{x}","\\sqrt[3]{}"],["\\sqrt[n]{x}","\\nthroot"],["\\frac{x}{y}","\\frac"],["\\sum^{s}_{x}{d}", "\\sum"],["\\prod^{s}_{x}{d}", "\\prod"],["\\coprod^{s}_{x}{d}", "\\coprod"],["\\int^{s}_{x}{d}", "\\int"],["\\binom{n}{k}", "\\binom"]],
        }
    },
    methods: {
        makeQuill (content) {
            let givenOptions={
                displayHistory: true,
            };
            (function($, Quill) {
                $(document).ready(() => {
                    const quillOptions = {
                        modules: {
                            formula: true,
                            toolbar: [["bold", "italic", "underline", "link", "image","video","formula"]]
                        },
                        placeholder:
                            "Type text here, or click on the formula button to enter math.",
                        theme: "snow"
                    };

                    const enableMathQuillFormulaAuthoring = window.mathquill4quill();
                    const quill = new Quill("#editor", quillOptions);
                    enableMathQuillFormulaAuthoring(quill, givenOptions);
                    if (typeof content == "string") quill.setText(content);
                    else quill.setContents(content)
                    myQuill = quill;
                });
            })(window.jQuery, window.Quill);
        },
        sendContent () {
            this.$emit("content",myQuill.getContents())
        },
    },
    
    /* eslint-env browser */

    mounted: function () {
        this.makeQuill(this.content);
    },
    watch: {
        content: function() {
            if (typeof this.content == "string") myQuill.setText(this.content);
            else myQuill.setContents(this.content);
        }
    }
}
</script>

<style scoped>
#editor {
    z-index: 10;
}
</style>