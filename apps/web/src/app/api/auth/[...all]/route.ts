import { auth } from '@/lib/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';

// toNextJsHandler renvoie un objet de handlers par méthode : il faut les
// déstructurer, pas exporter l'objet lui-même comme s'il était une fonction.
export const { GET, POST } = toNextJsHandler(auth.handler);
