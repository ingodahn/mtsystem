<template>
  <v-container>
    <v-btn color="primary" class="mx-1 my-1" @click="copyText"
      >Copy as Text</v-btn
    >
  </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
  props: [],
  data() {
    return {
      session: this.$root.$data.session,
    };
  },
  methods: {
    reportSuccess (success) {
      let responseDiv=document.getElementById('js_cp_response');
      let response=(success)?'Graph description copied to clipboard':'Sorry, something went wrong';
      alert(response);
    },
    copyText() {
      const graph = this.$parent.graphForHtml();
      let graphText = "";
      graph.links.forEach((link) => {
        graphText += link.name + ".\n";
      });
      //alert(graphText);
      this.copyTextToClipboard(graphText);
    },
    fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
      
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
        try {
          var successful = document.execCommand('copy');
          this.reportSuccess(successful);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
      
        document.body.removeChild(textArea);
      },
      copyTextToClipboard(text) {
        let me=this;
        if (!navigator.clipboard) {
          this.fallbackCopyTextToClipboard(text);
          return;
        }
        navigator.clipboard.writeText(text).then(function() {
          me.reportSuccess(true);
          console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
          me.reportSuccess(false);
          console.error('Async: Could not copy text: ', err);
        });
      }
  },
};
</script>
