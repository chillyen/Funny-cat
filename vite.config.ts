import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg';
import dns from 'dns';


export default defineConfig({
	plugins: [sveltekit(), svg()],
	// server: {
	// 	host: '0.0.0.0'
	//   }
});
//我過去有嘗試過server.host，但它顯示