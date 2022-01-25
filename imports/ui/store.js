// store.js
import Vue from "vue";
const state = Vue.observable({ currentNode: '' });
export const set = (value) => state.currentNode = value;
export default state;