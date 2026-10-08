import { mount } from 'svelte';
import App from './App.svelte';
import DndApp from './DndApp.svelte';
import '@keenmate/svelte-treeview/styles.css';

const target = document.getElementById('treeview-app');
if (target) {
  mount(App, { target });
}

const dndTarget = document.getElementById('treeview-dnd-app');
if (dndTarget) {
  mount(DndApp, { target: dndTarget });
}
