import { mount } from 'svelte';
import App from './App.svelte';
import './style.css';
import './workspace.css';
import './theme.css';
import './info.css';
const target = document.getElementById('app');
target.replaceChildren();
mount(App, { target });
